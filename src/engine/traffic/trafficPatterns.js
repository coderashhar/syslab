const PATTERN_LABELS = {
  constant: "Constant",
  burst: "Burst",
  increasing: "Increasing",
  decreasing: "Decreasing",
  random: "Random (seeded)",
  custom: "Custom cycle",
};

export const trafficPatterns = Object.entries(PATTERN_LABELS).map(([id, label]) => ({ id, label }));

function seededValue(seed, step) {
  let value = (Number(seed) || 1) + (step * 374761393);
  value = (value ^ (value >>> 13)) * 1274126177;
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

export function getTrafficRate(pattern = "constant", timestamp = 0, config = {}) {
  const baseRate = Math.max(0, Number(config.requestRate ?? 3));
  const time = Math.max(0, Number(timestamp));
  if (pattern === "burst") {
    return time % 12 < 2 ? Math.max(baseRate * 4, 8) : baseRate;
  }
  if (pattern === "increasing") {
    return Math.max(0, baseRate * (0.35 + Math.min(time / 10, 1) * 1.65));
  }
  if (pattern === "decreasing") {
    return Math.max(0, baseRate * (2 - Math.min(time / 10, 1) * 1.65));
  }
  if (pattern === "random") {
    const step = Math.floor(time * 2);
    return baseRate * (0.25 + seededValue(config.randomSeed ?? 7, step) * 1.75);
  }
  if (pattern === "custom") {
    const activeDuration = Math.max(0.1, Number(config.customActiveDuration ?? 10));
    const restDuration = Math.max(0, Number(config.customRestDuration ?? 5));
    const cycleDuration = activeDuration + restDuration;
    return time % cycleDuration < activeDuration ? Math.max(0, Number(config.customRequestRate ?? baseRate)) : 0;
  }
  return baseRate;
}

export function describeTrafficPattern(pattern = "constant", config = {}) {
  if (pattern === "custom") {
    return `${config.customRequestRate ?? config.requestRate ?? 3} req/s for ${config.customActiveDuration ?? 10}s, then ${config.customRestDuration ?? 5}s rest`;
  }
  if (pattern === "random") return `seed ${config.randomSeed ?? 7}`;
  return PATTERN_LABELS[pattern] ?? PATTERN_LABELS.constant;
}
