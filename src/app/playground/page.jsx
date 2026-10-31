import TokenBucketPlayground from "@/components/simulator/TokenBucketPlayground";

export const metadata = { title: "Playground · SysLab" };

export default function PlaygroundPage() { return <div className="page-wrap"><div style={{ marginBottom: 24 }}><div className="eyebrow">Playground</div><h1 style={{ fontSize: 42, letterSpacing: "-.06em", margin: "12px 0 8px" }}>Run the system.</h1><p className="muted" style={{ maxWidth: 610, fontSize: 14, lineHeight: 1.6, margin: 0 }}>A deterministic sandbox for understanding how Token Bucket responds to time, capacity, and traffic.</p></div><TokenBucketPlayground /></div>; }
