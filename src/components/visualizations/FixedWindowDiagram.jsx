"use client";

import { ArrowRight, Check, RotateCcw, X } from "lucide-react";

function formatTime(value) {
  return `${Number(value).toFixed(1)}s`;
}

export default function FixedWindowDiagram({ state }) {
  const { windowStart, windowSize, limit, count } = state.bucket;
  const elapsed = Math.max(0, state.virtualTime - windowStart);
  const progress = Math.min(100, (elapsed / windowSize) * 100);
  const recent = state.events.filter((event) => event.requestId).slice(-7);
  const windows = [-1, 0, 1].map((offset) => windowStart + offset * windowSize);

  return <div className="surface" style={{ padding: 20, minHeight: 470 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div><div className="eyebrow">Live state</div><h2 style={{ fontSize: 18, margin: "6px 0 0", letterSpacing: "-.02em" }}>Count requests inside a window</h2></div>
      <span className="muted mono" style={{ fontSize: 11 }}>discrete reset</span>
    </div>
    <div className="request-lane" style={{ margin: "30px 0 15px" }}>
      <div className="request-chip" style={{ borderColor: "#79571c", background: "#332716", color: "#f3c676" }}>incoming</div>
      <ArrowRight size={16} className="muted" />
      <div style={{ display: "flex", gap: 6, overflow: "hidden" }}>{recent.length ? recent.map((event) => <div key={event.id} className={`request-chip ${event.status}`}>{event.requestId?.replace("req-", "#")}</div>) : <span className="muted" style={{ fontSize: 12 }}>Run the simulation to send requests</span>}</div>
    </div>
    <div className="fixed-window-track" aria-label="Fixed window timeline">
      {windows.map((start, index) => {
        const current = index === 1;
        return <div key={start} className={`fixed-window-segment${current ? " current" : ""}`}>
          <div className="fixed-window-segment-head"><span>{current ? "Current" : start < windowStart ? "Previous" : "Next"}</span><span className="mono">{formatTime(start)}</span></div>
          <div className="fixed-window-segment-count">{current ? count : "—"}<span> / {limit}</span></div>
          <div className="fixed-window-segment-bar"><div style={{ width: current ? `${(count / limit) * 100}%` : 0 }} /></div>
          <div className="muted" style={{ fontSize: 10 }}>{formatTime(start + windowSize)}</div>
        </div>;
      })}
    </div>
    <div className="fixed-window-clock">
      <div><span className="muted" style={{ fontSize: 11 }}>Current window</span><strong className="mono">{formatTime(windowStart)} – {formatTime(windowStart + windowSize)}</strong></div>
      <div style={{ textAlign: "right" }}><span className="muted" style={{ fontSize: 11 }}>Resets in</span><strong className="mono" style={{ color: "#f3c676" }}>{formatTime(windowSize - elapsed)}</strong></div>
    </div>
    <div className="timeline" style={{ marginTop: 12, background: "#3b3020" }}><div className="timeline-progress" style={{ width: `${progress}%`, background: "#d99a2b" }} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
      <div className="surface" style={{ padding: 12, background: "#2d2415", borderColor: "#6a4c18" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#f3c676", fontSize: 12 }}><RotateCcw size={15} /> Counter resets at the boundary</div></div>
      <div className="surface" style={{ padding: 12, background: "#2d1b25", borderColor: "#5d2d3f" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ff9eae", fontSize: 12 }}><X size={15} /> Rejected after the limit</div></div>
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, color: "#8ee5a9", fontSize: 11 }}><Check size={14} /> {state.metrics.accepted} accepted so far · t = {formatTime(state.virtualTime)}</div>
  </div>;
}
