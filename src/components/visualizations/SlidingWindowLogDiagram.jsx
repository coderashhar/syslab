"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Clock3, X } from "lucide-react";

function formatTime(value) {
  return `${Number(value).toFixed(1)}s`;
}

export default function SlidingWindowLogDiagram({ state }) {
  const [visualTime, setVisualTime] = useState(state.virtualTime);
  const animationBase = useRef({ virtualTime: state.virtualTime, wallTime: 0 });
  const { timestamps, windowSize, limit } = state.bucket;
  const cutoff = visualTime - windowSize;
  const chartPadding = 0.1;
  const chartBuffer = (windowSize * chartPadding) / (1 - (chartPadding * 2));
  const chartStart = cutoff - chartBuffer;
  const chartSpan = windowSize + (chartBuffer * 2);
  const recent = state.events.filter((event) => event.requestId).slice(-7);
  const requestEvents = state.events.filter((event) => event.requestId && event.timestamp >= chartStart && event.timestamp <= visualTime);
  const expiringAccepted = requestEvents.filter((event) => event.status === "accepted" && event.timestamp <= cutoff).slice(-2);
  const activeAccepted = requestEvents.filter((event) => event.status === "accepted" && event.timestamp > cutoff).slice(-6);
  const recentRejected = requestEvents.filter((event) => event.status === "rejected" && event.timestamp > cutoff).slice(-4);
  const dotCandidates = [...expiringAccepted, ...activeAccepted, ...recentRejected].sort((a, b) => a.timestamp - b.timestamp);
  const dotGroups = new Map();
  dotCandidates.forEach((event) => {
    const key = `${event.status}-${event.timestamp}`;
    dotGroups.set(key, [...(dotGroups.get(key) || []), event]);
  });
  const dots = dotCandidates.map((event) => {
    const group = dotGroups.get(`${event.status}-${event.timestamp}`);
    const groupIndex = group.findIndex((item) => item.id === event.id);
    const spread = (groupIndex - ((group.length - 1) / 2)) * 2.2;
    const baseLeft = ((event.timestamp - chartStart) / chartSpan) * 100;
    return { ...event, expired: event.timestamp <= cutoff, left: Math.min(100, Math.max(0, baseLeft + spread)) };
  });

  useEffect(() => {
    animationBase.current = { virtualTime: state.virtualTime, wallTime: performance.now() };
    setVisualTime(state.virtualTime);
  }, [state.virtualTime]);

  useEffect(() => {
    if (state.status !== "running") return undefined;
    let frame;
    const animate = () => {
      const elapsed = (performance.now() - animationBase.current.wallTime) / 1000;
      setVisualTime(animationBase.current.virtualTime + elapsed);
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [state.status]);

  return <div className="surface" style={{ padding: 20, minHeight: 470 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div><div className="eyebrow">Live state</div><h2 style={{ fontSize: 18, margin: "6px 0 0", letterSpacing: "-.02em" }}>Keep only recent timestamps</h2></div>
      <span className="muted mono" style={{ fontSize: 11 }}>rolling horizon</span>
    </div>
    <div className="request-lane" style={{ margin: "30px 0 15px" }}>
      <div className="request-chip" style={{ borderColor: "#7b3244", background: "#3d1d29", color: "#ff9eae" }}>incoming</div>
      <ArrowRight size={16} className="muted" />
      <div style={{ display: "flex", gap: 6, overflow: "hidden" }}>{recent.length ? recent.map((event) => <div key={event.id} className={`request-chip ${event.status}`}>{event.requestId?.replace("req-", "#")}</div>) : <span className="muted" style={{ fontSize: 12 }}>Run the simulation to send requests</span>}</div>
    </div>
    <div className="sliding-log-summary"><div><span className="muted" style={{ fontSize: 11 }}>Live log</span><strong className="mono">{timestamps.length} / {limit} timestamps</strong></div><div style={{ textAlign: "right" }}><span className="muted" style={{ fontSize: 11 }}>Expires before</span><strong className="mono" style={{ color: "#ff9eae" }}>{formatTime(cutoff)}</strong></div></div>
    <div className="sliding-log-track" aria-label="Rolling timestamp window">
      <div className="sliding-log-window-highlight" />
      <div className="sliding-log-line" />
      {dots.map(({ id, timestamp, status, expired, left }) => <div className={`sliding-log-dot ${status}${expired ? " expired" : ""}`} key={id} style={{ left: `${left}%` }} title={`${status === "accepted" ? "Accepted" : "Rejected"} request at ${formatTime(timestamp)}`} aria-label={`${status === "accepted" ? "Accepted" : "Rejected"} request at ${formatTime(timestamp)}`} />)}
      {!dots.length && <div className="sliding-log-empty">No requests near the current window</div>}
      <div className="sliding-log-now" style={{ left: `${(1 - chartPadding) * 100}%` }}><span>now</span><i /></div>
    </div>
    <div className="sliding-log-axis"><span>{formatTime(cutoff)}</span><span>{formatTime(visualTime)}</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
      <div className="surface" style={{ padding: 12, background: "#221a2d", borderColor: "#5b376c" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#d7a8ed", fontSize: 12 }}><Clock3 size={15} /> Old timestamps expire continuously</div></div>
      <div className="surface" style={{ padding: 12, background: "#2d1b25", borderColor: "#5d2d3f" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ff9eae", fontSize: 12 }}><X size={15} /> Rejected while log is full</div></div>
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, color: "#8ee5a9", fontSize: 11 }}><Check size={14} /> {state.metrics.accepted} accepted so far · t = {formatTime(visualTime)}</div>
  </div>;
}
