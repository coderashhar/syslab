export default function StatCard({ label, value, hint, tone = "default" }) {
  return <div className="surface" style={{ padding: 16 }}><div className="muted" style={{ fontSize: 11 }}>{label}</div><div className="metric-value" style={{ color: tone === "green" ? "#7be69b" : tone === "red" ? "#ff9aaa" : tone === "violet" ? "#bcaeff" : "#f4f2ff", marginTop: 5 }}>{value}</div>{hint && <div className="muted" style={{ fontSize: 11, marginTop: 5 }}>{hint}</div>}</div>;
}
