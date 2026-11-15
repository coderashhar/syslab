"use client";

import { ArrowRight, Check, Clock3, X } from "lucide-react";

function formatTime(value) {
  return `${Number(value).toFixed(1)}s`;
}

export default function SlidingWindowCounterDiagram({ state }) {
  const { currentWindowStart, windowSize, currentCount, previousCount, limit } = state.bucket;
  const elapsed = Math.max(0, state.virtualTime - currentWindowStart);
  const previousWeight = Math.max(0, 1 - (elapsed / windowSize));
  const weightedCount = currentCount + (previousCount * previousWeight);
  const recent = state.events.filter((event) => event.requestId).slice(-7);

  return <div className="surface" style={{ padding: 20, minHeight: 470 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div><div className="eyebrow">Live state</div><h2 style={{ fontSize: 18, margin: "6px 0 0", letterSpacing: "-.02em" }}>Blend two fixed windows</h2></div>
      <span className="muted mono" style={{ fontSize: 11 }}>weighted estimate</span>
    </div>
    <div className="request-lane" style={{ margin: "30px 0 15px" }}>
      <div className="request-chip" style={{ borderColor: "#277447", background: "#163523", color: "#8ee5a9" }}>incoming</div>
      <ArrowRight size={16} className="muted" />
      <div style={{ display: "flex", gap: 6, overflow: "hidden" }}>{recent.length ? recent.map((event) => <div key={event.id} className={`request-chip ${event.status}`}>{event.requestId?.replace("req-", "#")}</div>) : <span className="muted" style={{ fontSize: 12 }}>Run the simulation to send requests</span>}</div>
    </div>
    <div className="counter-window-grid">
      <div className="counter-window previous"><div className="counter-window-head"><span>Previous window</span><span className="mono">{formatTime(currentWindowStart - windowSize)}</span></div><div className="counter-window-count">{previousCount}<span> / {limit}</span></div><div className="counter-window-bar"><div style={{ width: `${Math.min(100, (previousCount / limit) * 100)}%` }} /></div><div className="muted" style={{ fontSize: 10 }}>weighting: {(previousWeight * 100).toFixed(0)}%</div></div>
      <div className="counter-window current"><div className="counter-window-head"><span>Current window</span><span className="mono">{formatTime(currentWindowStart)}</span></div><div className="counter-window-count">{currentCount}<span> / {limit}</span></div><div className="counter-window-bar"><div style={{ width: `${Math.min(100, (currentCount / limit) * 100)}%` }} /></div><div className="muted" style={{ fontSize: 10 }}>through {formatTime(currentWindowStart + windowSize)}</div></div>
    </div>
    <div className="counter-formula"><div><span className="muted" style={{ fontSize: 11 }}>Estimated count</span><strong className="mono">{weightedCount.toFixed(2)} / {limit}</strong></div><div style={{ textAlign: "right" }}><span className="muted" style={{ fontSize: 11 }}>Previous weight</span><strong className="mono" style={{ color: "#4ade80" }}>{(previousWeight * 100).toFixed(0)}%</strong></div></div>
    <div className="timeline counter-timeline"><div className="timeline-progress" style={{ width: `${Math.min(100, (weightedCount / limit) * 100)}%`, background: "#4caf73" }} /></div>
    <div className="sliding-counter-clock"><span>{formatTime(currentWindowStart)}</span><span><Clock3 size={12} /> t = {formatTime(state.virtualTime)}</span><span>{formatTime(currentWindowStart + windowSize)}</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}><div className="surface" style={{ padding: 12, background: "#17261d", borderColor: "#285a3a" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#8ee5a9", fontSize: 12 }}><Check size={15} /> Smoothly fades the previous count</div></div><div className="surface" style={{ padding: 12, background: "#2d1b25", borderColor: "#5d2d3f" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ff9eae", fontSize: 12 }}><X size={15} /> Rejects when the estimate is full</div></div></div>
  </div>;
}
