import { describe, expect, it } from "vitest";
import { consumeToken, createTokenBucket, refillTokenBucket } from "../../src/engine/algorithms/tokenBucket";
import { advanceSimulation, createSimulation } from "../../src/engine/simulation/SimulationEngine";

describe("token bucket", () => {
  it("caps refill at capacity", () => {
    const state = createTokenBucket({ capacity: 5, refillRate: 2, initialTokens: 1 });
    expect(refillTokenBucket(state, 10).tokens).toBe(5);
  });
  it("accepts while a token is available and consumes it", () => {
    const result = consumeToken(createTokenBucket({ capacity: 2, initialTokens: 1 }), { id: "a", timestamp: 0 });
    expect(result.event.status).toBe("accepted");
    expect(result.state.tokens).toBe(0);
  });
  it("rejects when empty", () => {
    const result = consumeToken(createTokenBucket({ capacity: 2, initialTokens: 0 }), { id: "a", timestamp: 0 });
    expect(result.event.status).toBe("rejected");
    expect(result.event.reason).toContain("empty");
  });
  it("refills before deciding a later request", () => {
    const result = consumeToken(createTokenBucket({ capacity: 2, refillRate: 1, initialTokens: 0 }), { id: "a", timestamp: 1 });
    expect(result.event.status).toBe("accepted");
    expect(result.state.tokens).toBe(0);
  });
  it("replays the same virtual workload deterministically", () => {
    const run = () => advanceSimulation(advanceSimulation(createSimulation({ capacity: 2, refillRate: 1, initialTokens: 1 }), { elapsed: 0.5, arrivals: 2 }), { elapsed: 1, arrivals: 2 });
    expect(run().events.map((event) => event.type)).toEqual(run().events.map((event) => event.type));
    expect(run().metrics).toEqual({ total: 4, accepted: 2, rejected: 2 });
  });
});
