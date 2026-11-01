"use client";

import { ArrowDown, ArrowRight, Check, X } from "lucide-react";

export default function LeakyBucketDiagram({ queueLength, capacity, events }) {
  const recent = events.filter((event) => event.requestId).slice(-5);
  const fill = Math.min(100, (queueLength / capacity) * 100);
  return <div className="surface" style={{ padding: 20, minHeight: 470 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><div className="eyebrow">Live state</div><h2 style={{ fontSize: 18, margin: "6px 0 0", letterSpacing: "-.02em" }}>Requests enter, queue drains</h2></div><span className="muted mono" style={{ fontSize: 11 }}>fixed processing rate</span></div>
    <div className="request-lane" style={{ margin: "30px 0 14px" }}><div className="request-chip">incoming</div><ArrowRight size={16} className="muted" /><div style={{ display: "flex", gap: 6 }}>{recent.length ? recent.map((event) => <div key={event.id} className={`request-chip ${event.status === "rejected" ? "rejected" : "accepted"}`}>{event.requestId?.replace("req-", "#")}</div>) : <span className="muted" style={{ fontSize: 12 }}>Run the simulation to send requests</span>}</div></div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, height: 260 }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#60a5fa" }}><ArrowDown size={24} /><span style={{ fontSize: 11, marginTop: 5 }}>fixed drain</span></div><div style={{ position: "relative", width: 210, height: 190 }}><div className="bucket-rim" style={{ width: 210 }} /><div className="bucket-shell" style={{ width: 210, height: 190, borderColor: "#60a5fa" }}><div className="bucket-fill" style={{ height: `${fill}%`, background: "linear-gradient(180deg, #93c5fd, #3b82f6)" }} /><div className="bucket-label">{queueLength}<div className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ {capacity} queued</div></div></div></div></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}><div className="surface" style={{ padding: 12, background: "#17243a", borderColor: "#294b76" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#9bc6ff", fontSize: 12 }}><Check size={15} /> Queued until the drain processes it</div></div><div className="surface" style={{ padding: 12, background: "#2d1b25", borderColor: "#5d2d3f" }}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ff9eae", fontSize: 12 }}><X size={15} /> Rejected when queue is full</div></div></div>
  </div>;
}
