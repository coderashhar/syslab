"use client";

import { ArrowDown, ArrowRight, Check, X } from "lucide-react";

export default function TokenBucketDiagram({ tokens, capacity, events }) {
  const recent = events.filter((event) => event.requestId).slice(-5);
  return <div className="surface" style={{ padding: 20, minHeight: 470 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><div className="eyebrow">Live state</div><h2 style={{ fontSize: 18, margin: "6px 0 0", letterSpacing: "-.02em" }}>Requests meet the bucket</h2></div><span className="muted mono" style={{ fontSize: 11 }}>deterministic replay</span></div>
    <div className="request-lane" style={{ margin: "30px 0 14px" }}><div className="request-chip">incoming</div><ArrowRight size={16} className="muted" /><div style={{ display: "flex", gap: 6 }}>{recent.length ? recent.map((event) => <div key={event.id} className={`request-chip ${event.status}`}>{event.requestId?.replace("req-", "#")}</div>) : <span className="muted" style={{ fontSize: 12 }}>Run the simulation to send requests</span>}</div></div>
    <div className="bucket" style={{ marginTop: 5 }}><div style={{ position: "absolute", top: 4, display: "flex", flexDirection: "column", alignItems: "center", color: "#a78bfa" }}><ArrowDown size={22} /><span style={{ fontSize: 11 }}>refill rate</span></div><div className="bucket-rim" /><div className="bucket-shell"><div className="bucket-fill" style={{ height: `${Math.max(0, Math.min(100, (tokens / capacity) * 100))}%` }} /><div className="bucket-label">{tokens.toFixed(1)}<div className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ {capacity} tokens</div></div></div></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}><div className="surface" style={{ padding: 12, background: "#17261d", borderColor: "#285a3a" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#8ee5a9", fontSize: 12 }}><Check size={15} /> Accepted when a token exists</div></div><div className="surface" style={{ padding: 12, background: "#2d1b25", borderColor: "#5d2d3f" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ff9eae", fontSize: 12 }}><X size={15} /> Rejected when empty</div></div></div>
  </div>;
}
