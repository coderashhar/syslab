"use client";

import { useMemo, useState } from "react";
import { Activity, Clock3, Gauge, Layers3 } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import TokenBucketDiagram from "@/components/visualizations/TokenBucketDiagram";
import SimulationControls from "@/components/simulator/SimulationControls";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";

const defaults = { capacity: 10, refillRate: 2, initialTokens: 6, requestRate: 3 };

export default function TokenBucketPlayground({ compact = false }) {
  const [config, setConfig] = useState(defaults);
  const { state, derived, step, reset, run, pause, burst } = useSimulation(config);
  const update = (key, value) => setConfig((current) => {
    const next = { ...current, [key]: Number(value) };
    if (key === "capacity") next.initialTokens = Math.min(next.initialTokens, next.capacity);
    return next;
  });
  const events = useMemo(() => [...state.events].reverse().slice(0, 7), [state.events]);
  return <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}><div>{!compact && <Badge>Token bucket lab</Badge>}<div className="muted" style={{ fontSize: 12, marginTop: compact ? 0 : 8 }}>Tune the inputs, then watch the virtual clock make each decision.</div></div><SimulationControls running={state.status === "running"} run={run} pause={pause} reset={reset} step={step} burst={burst} /></div>
    <div className="playground-grid">
      <section className="panel"><div className="panel-head"><span style={{ fontWeight: 700, fontSize: 13 }}>Configuration</span><Gauge size={16} className="muted" /></div><div className="panel-body">
        <label className="muted" style={{ display: "block", fontSize: 11, marginBottom: 6 }}>Algorithm</label><div className="input" style={{ marginBottom: 16, color: "#c5b7ff" }}>Token Bucket</div>
        {[ ["capacity", "Bucket capacity", 1, 20, 1], ["refillRate", "Refill tokens / sec", 0, 10, .5], ["initialTokens", "Initial tokens", 0, config.capacity, 1], ["requestRate", "Incoming requests / sec", 1, 10, 1] ].map(([key, label, min, max, stepValue]) => <div key={key} style={{ marginBottom: 18 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 7 }}><span className="muted">{label}</span><span className="mono" style={{ color: "#e3defb" }}>{config[key]}</span></div><input aria-label={label} className="range" type="range" min={min} max={max} step={stepValue} value={Math.min(config[key], max)} onChange={(event) => update(key, event.target.value)} /></div>)}
        <div style={{ borderTop: "1px solid #292938", paddingTop: 14, marginTop: 8 }}><div className="muted" style={{ fontSize: 11, marginBottom: 8 }}>Traffic pattern</div><div className="input" style={{ color: "#c5b7ff" }}>Constant traffic</div></div>
      </div></section>
      <section><TokenBucketDiagram tokens={state.bucket.tokens} capacity={state.bucket.capacity} events={state.events} /><div className="surface" style={{ marginTop: 14, padding: 16 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Clock3 size={15} className="muted" /><span style={{ fontSize: 12, fontWeight: 700 }}>Virtual timeline</span></div><span className="mono" style={{ color: "#c5b7ff", fontSize: 12 }}>t = {state.virtualTime.toFixed(1)}s</span></div><div className="timeline"><div className="timeline-progress" style={{ width: `${Math.min(100, (state.virtualTime / 30) * 100)}%` }} /></div><div className="muted" style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 7 }}><span>0s</span><span>30s window</span></div></div></section>
      <section className="panel metrics-panel"><div className="panel-head"><span style={{ fontWeight: 700, fontSize: 13 }}>Live metrics</span><Activity size={16} className="muted" /></div><div className="panel-body" style={{ display: "grid", gap: 9 }}><StatCard label="Total requests" value={state.metrics.total} hint="processed by engine" /><StatCard label="Accepted" value={state.metrics.accepted} hint={`${derived.acceptanceRate.toFixed(0)}% acceptance`} tone="green" /><StatCard label="Rejected" value={state.metrics.rejected} hint="bucket empty" tone="red" /><StatCard label="Tokens now" value={state.bucket.tokens.toFixed(1)} hint={`of ${state.bucket.capacity}`} tone="violet" /></div></section>
    </div>
    <section className="surface" style={{ marginTop: 14, padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Layers3 size={15} className="muted" /><span style={{ fontSize: 12, fontWeight: 700 }}>Event log</span></div><span className="muted" style={{ fontSize: 11 }}>{state.events.length} recorded events</span></div>{events.length === 0 ? <div className="muted" style={{ padding: "16px 0", fontSize: 12 }}>Your first event will appear here.</div> : events.map((event) => <div className="event-row" key={event.id}><span className={`status-dot ${event.status === "accepted" ? "status-accepted" : event.status === "rejected" ? "status-rejected" : "status-info"}`} /><span className="mono" style={{ width: 44, color: "#a7a3b3" }}>t {event.timestamp.toFixed(1)}</span><span style={{ color: event.status === "accepted" ? "#8ee5a9" : event.status === "rejected" ? "#ff9eae" : "#c5b7ff" }}>{event.type.replaceAll("_", " ")}</span><span className="muted" style={{ marginLeft: "auto" }}>{event.reason}</span></div>)}</section>
  </div>;
}
