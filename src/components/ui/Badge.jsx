export default function Badge({ children, tone = "violet" }) {
  const colors = { violet: ["#32255d", "#c5b7ff"], green: ["#153d28", "#8ee5a9"], amber: ["#493516", "#f3c676"], red: ["#431d2a", "#ff9eae"] };
  const [background, color] = colors[tone] || colors.violet;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, padding: "4px 8px", background, color, fontSize: 11, fontWeight: 700 }}>{children}</span>;
}
