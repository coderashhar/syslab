"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Activity, Gauge, Layers3 } from "lucide-react";
import { consumeSlidingWindow, createSlidingWindowLog, pruneSlidingWindow } from "@/engine/algorithms/slidingWindowLog";
import SlidingWindowLogDiagram from "@/components/visualizations/SlidingWindowLogDiagram";
import SimulationControls from "@/components/simulator/SimulationControls";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";

const defaults = { limit: 5, windowSize: 10, requestRate: 3 };

function createState(config) {
  return { status: "idle", virtualTime: 0, requestSequence: 0, trafficRemainder: 0, bucket: createSlidingWindowLog(config), events: [], metrics: { total: 0, accepted: 0, rejected: 0 } };
}

function advance(state, config, { elapsed = 1, arrivals } = {}) {
  const nextTime = Number((state.virtualTime + Math.max(0, elapsed)).toFixed(3));
  const pruned = pruneSlidingWindow(state.bucket, nextTime);
  const newEvents = pruned.removed ? [{ id: `prune-${nextTime}`, timestamp: nextTime, type: "TIMESTAMPS_EXPIRED", status: "info", reason: `${pruned.removed} timestamp${pruned.removed === 1 ? "" : "s"} expired outside the rolling window.` }] : [];
  const requested = arrivals == null ? state.trafficRemainder + (config.requestRate * Math.max(0, elapsed)) : Number(arrivals);
  const count = Math.max(0, Math.floor(requested));
  let bucket = pruned.state;
  let sequence = state.requestSequence;
  let accepted = state.metrics.accepted;
  let rejected = state.metrics.rejected;
  for (let index = 0; index < count; index += 1) {
    sequence += 1;
    const result = consumeSlidingWindow(bucket, { id: `req-${sequence}`, timestamp: nextTime });
    bucket = result.state;
    newEvents.push(result.event);
    if (result.event.status === "accepted") accepted += 1; else rejected += 1;
  }
  return { ...state, status: state.status === "running" ? "running" : "paused", virtualTime: nextTime, requestSequence: sequence, trafficRemainder: arrivals == null ? requested - count : state.trafficRemainder, bucket, events: [...state.events, ...newEvents].slice(-80), metrics: { total: state.metrics.total + count, accepted, rejected } };
}

function reducer(state, action) {
  if (action.type === "RESET") return createState(action.config);
  if (action.type === "RUN") return { ...state, status: "running" };
  if (action.type === "PAUSE") return { ...state, status: "paused" };
  if (action.type === "STEP") return advance(state, action.config, action.options);
  if (action.type === "BURST") return advance(state, action.config, { elapsed: 0.1, arrivals: action.count });
  return state;
}

export default function SlidingWindowLogPlayground({ compact = false }) {
  const [config, setConfig] = useState(defaults);
  const [state, dispatch] = useReducer(reducer, config, createState);
  const update = (key, value) => setConfig((current) => ({ ...current, [key]: Number(value) }));
  const step = useCallback((options = {}) => dispatch({ type: "STEP", options, config }), [config]);
  const reset = useCallback(() => dispatch({ type: "RESET", config }), [config]);
  const events = useMemo(() => [...state.events].reverse(), [state.events]);

  useEffect(() => { dispatch({ type: "RESET", config }); }, [config.limit, config.windowSize, config.requestRate]);
  useEffect(() => {
    if (state.status !== "running") return undefined;
    const timer = window.setInterval(() => step({ elapsed: 0.1 }), 100);
    return () => window.clearInterval(timer);
  }, [state.status, step]);

  return <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}><div>{!compact && <Badge tone="red">Sliding log lab</Badge>}<div className="muted" style={{ fontSize: 12, marginTop: compact ? 0 : 8 }}>Tune the limit, then watch old timestamps fall out of the rolling window.</div></div><SimulationControls running={state.status === "running"} run={() => dispatch({ type: "RUN" })} pause={() => dispatch({ type: "PAUSE" })} reset={reset} step={(options) => step(options)} burst={() => dispatch({ type: "BURST", count: 6 })} /></div>
    <div className="playground-grid">
      <section className="panel"><div className="panel-head"><span style={{ fontWeight: 700, fontSize: 13 }}>Configuration</span><Gauge size={16} className="muted" /></div><div className="panel-body">
        {[['limit', 'Requests in window', 1, 20, 1], ['windowSize', 'Window length (sec)', 2, 30, 1], ['requestRate', 'Incoming requests / sec', 1, 10, 1]].map(([key, label, min, max, stepValue]) => <div key={key} style={{ marginBottom: 19 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 7 }}><span className="muted">{label}</span><span className="mono" style={{ color: "#ff9eae" }}>{config[key]}</span></div><input aria-label={label} className="range" type="range" min={min} max={max} step={stepValue} value={config[key]} onChange={(event) => update(key, event.target.value)} /></div>)}
        <div style={{ borderTop: "1px solid #292938", paddingTop: 14, marginTop: 8 }}><div className="eyebrow" style={{ fontSize: 10 }}>Rule</div><div style={{ fontSize: 12, lineHeight: 1.55, marginTop: 7 }}>Allow up to <span className="mono" style={{ color: "#ff9eae" }}>{config.limit}</span> timestamps newer than <span className="mono" style={{ color: "#ff9eae" }}>now − {config.windowSize}s</span>.</div></div>
      </div></section>
      <section><SlidingWindowLogDiagram state={state} /><div className="surface" style={{ marginTop: 14, padding: 16 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Activity size={15} className="muted" /><span style={{ fontSize: 12, fontWeight: 700 }}>Log utilization</span></div><span className="mono" style={{ color: "#ff9eae", fontSize: 12 }}>{state.bucket.timestamps.length} / {state.bucket.limit}</span></div><div className="timeline" style={{ background: "#3d2832" }}><div className="timeline-progress" style={{ width: `${(state.bucket.timestamps.length / state.bucket.limit) * 100}%`, background: "#d65b70" }} /></div></div></section>
      <section className="panel metrics-panel"><div className="panel-head"><span style={{ fontWeight: 700, fontSize: 13 }}>Live metrics</span><Activity size={16} className="muted" /></div><div className="panel-body" style={{ display: "grid", gap: 9 }}><StatCard label="Total requests" value={state.metrics.total} hint="seen by engine" /><StatCard label="Accepted" value={state.metrics.accepted} hint={state.metrics.total ? `${((state.metrics.accepted / state.metrics.total) * 100).toFixed(0)}% acceptance` : "no traffic yet"} tone="green" /><StatCard label="Rejected" value={state.metrics.rejected} hint="log was full" tone="red" /><StatCard label="Current log" value={state.bucket.timestamps.length} hint={`of ${state.bucket.limit} allowed`} tone="violet" /></div></section>
    </div>
    <section className="surface" style={{ marginTop: 14, padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Layers3 size={15} className="muted" /><span style={{ fontSize: 12, fontWeight: 700 }}>Timeline</span></div><span className="muted" style={{ fontSize: 11 }}>{state.events.length} recorded events</span></div>{events.length === 0 ? <div className="muted" style={{ padding: "16px 0", fontSize: 12 }}>Your first event will appear here.</div> : events.map((event) => <div className="event-row" key={event.id}><span className={`status-dot ${event.status === "accepted" ? "status-accepted" : event.status === "rejected" ? "status-rejected" : "status-info"}`} /><span className="mono" style={{ width: 44, color: "#a7a3b3" }}>t {event.timestamp.toFixed(1)}</span><span style={{ color: event.status === "accepted" ? "#8ee5a9" : event.status === "rejected" ? "#ff9eae" : "#d7a8ed" }}>{event.type === "TIMESTAMPS_EXPIRED" ? "Timestamps expired" : `Request ${event.requestId?.replace("req-", "#")} ${event.status}`}</span><span className="muted" style={{ marginLeft: "auto" }}>{event.reason}</span></div>)}</section>
  </div>;
}
