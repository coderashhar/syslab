export const algorithms = [
  { id: "token-bucket", name: "Token Bucket", shortName: "Token bucket", color: "#a78bfa", status: "Available", summary: "Absorb controlled bursts while enforcing a long-term request rate.", complexity: "O(1) state", memory: "O(1)" },
  { id: "leaky-bucket", name: "Leaky Bucket", shortName: "Leaky bucket", color: "#60a5fa", status: "Coming soon", summary: "Smooth traffic by draining a queue at a fixed processing rate.", complexity: "O(1) state", memory: "O(n)" },
  { id: "fixed-window", name: "Fixed Window", shortName: "Fixed window", color: "#fbbf24", status: "Coming soon", summary: "Count requests in discrete windows and reset at each boundary.", complexity: "O(1) state", memory: "O(1)" },
  { id: "sliding-log", name: "Sliding Window Log", shortName: "Sliding log", color: "#fb7185", status: "Coming soon", summary: "Keep exact timestamps inside a rolling request window.", complexity: "O(log n)", memory: "O(n)" },
  { id: "sliding-counter", name: "Sliding Window Counter", shortName: "Sliding counter", color: "#4ade80", status: "Coming soon", summary: "Estimate a rolling count by weighting the previous window.", complexity: "O(1) state", memory: "O(1)" },
];

export const tokenBucketLesson = {
  title: "Token Bucket",
  kicker: "Rate limiting · 01",
  summary: "A small state machine that turns a traffic stream into a predictable stream of decisions.",
  sections: [
    { title: "The intuition", body: "Imagine a bucket that can hold a fixed number of tokens. A refill process adds tokens over time. Each request spends one token, so a quiet period creates capacity for a later burst." },
    { title: "The decision", body: "At request time, first bring the bucket up to date using elapsed virtual time. If at least one token is available, consume it and accept. Otherwise reject without changing capacity." },
    { title: "The trade-off", body: "The bucket gives bursts a clear ceiling while keeping the long-term rate bounded. It stores only a few numbers, which makes it a practical fit for an API gateway or middleware." },
  ],
};
