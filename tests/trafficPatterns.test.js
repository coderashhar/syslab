import { describe, expect, it } from "vitest";
import { describeTrafficPattern, getTrafficRate } from "../src/engine/traffic/trafficPatterns";

describe("traffic patterns", () => {
  it("runs a custom cycle for ten seconds, then rests", () => {
    const config = { customRequestRate: 8, customActiveDuration: 10, customRestDuration: 4 };
    expect(getTrafficRate("custom", 9.5, config)).toBe(8);
    expect(getTrafficRate("custom", 10, config)).toBe(0);
    expect(getTrafficRate("custom", 13.9, config)).toBe(0);
    expect(getTrafficRate("custom", 14, config)).toBe(8);
  });

  it("keeps seeded random traffic reproducible", () => {
    const config = { requestRate: 4, randomSeed: 12 };
    expect(getTrafficRate("random", 2, config)).toBe(getTrafficRate("random", 2, config));
  });

  it("describes the custom schedule in the control panel", () => {
    expect(describeTrafficPattern("custom", { customRequestRate: 5, customActiveDuration: 10, customRestDuration: 3 })).toContain("5 req/s for 10s");
  });
});
