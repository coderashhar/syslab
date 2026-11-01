import { describe, expect, it } from "vitest";
import { createLeakyBucket, drainLeakyBucket, enqueueLeakyRequest } from "../../src/engine/algorithms/leakyBucket";
import { advanceSimulation, createSimulation } from "../../src/engine/simulation/SimulationEngine";

describe("leaky bucket", () => {
  it("queues requests until capacity is reached", () => {
    let state = createLeakyBucket({ queueCapacity: 2 });
    state = enqueueLeakyRequest(state, { id: "a", timestamp: 0 }).state;
    state = enqueueLeakyRequest(state, { id: "b", timestamp: 0 }).state;
    const overflow = enqueueLeakyRequest(state, { id: "c", timestamp: 0 });
    expect(state.queue).toHaveLength(2);
    expect(overflow.event.type).toBe("QUEUE_OVERFLOW");
  });

  it("drains at a fixed processing rate", () => {
    const state = { ...createLeakyBucket({ queueCapacity: 5, processingRate: 2 }), queue: [{ id: "a" }, { id: "b" }, { id: "c" }] };
    const result = drainLeakyBucket(state, 1);
    expect(result.processed).toHaveLength(2);
    expect(result.state.queue).toHaveLength(1);
  });

  it("records queued, processed, and overflow metrics", () => {
    let state = createSimulation({ algorithm: "leaky-bucket", queueCapacity: 2, processingRate: 1, requestRate: 0 });
    state = advanceSimulation(state, { elapsed: 0, arrivals: 3 });
    state = advanceSimulation(state, { elapsed: 1, arrivals: 0 });
    expect(state.metrics).toMatchObject({ total: 3, accepted: 2, rejected: 1, queued: 2, processed: 1 });
    expect(state.events.some((event) => event.type === "QUEUE_OVERFLOW")).toBe(true);
  });
});
