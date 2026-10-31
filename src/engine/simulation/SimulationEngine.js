import { consumeToken, createTokenBucket, refillTokenBucket } from "../algorithms/tokenBucket";
import { getTrafficRate } from "../traffic/trafficPatterns";

export function createSimulation(config = {}) {
  return {
    status: "idle",
    virtualTime: 0,
    requestSequence: 0,
    trafficRemainder: 0,
    bucket: createTokenBucket(config),
    events: [],
    metrics: { total: 0, accepted: 0, rejected: 0 },
  };
}

export function advanceSimulation(simulation, { elapsed = 0.5, arrivals, arrivalRate, trafficPattern = "constant", trafficConfig = {} } = {}) {
  const nextTime = Number((simulation.virtualTime + Math.max(0, elapsed)).toFixed(3));
  let bucket = refillTokenBucket(simulation.bucket, nextTime);
  const refillEvent = elapsed > 0 && bucket.tokens !== simulation.bucket.tokens ? {
    id: `refill-${nextTime}`,
    timestamp: nextTime,
    type: "TOKEN_REFILLED",
    status: "info",
    reason: `Refilled ${Math.max(0, (bucket.tokens - simulation.bucket.tokens)).toFixed(2)} tokens over ${elapsed.toFixed(1)}s.`,
    stateBefore: simulation.bucket,
    stateAfter: bucket,
  } : null;
  const newEvents = refillEvent ? [refillEvent] : [];
  let sequence = simulation.requestSequence;
  let accepted = simulation.metrics.accepted;
  let rejected = simulation.metrics.rejected;
  const effectiveRate = arrivalRate == null ? getTrafficRate(trafficPattern, nextTime, trafficConfig) : arrivalRate;
  const requested = arrivals == null ? simulation.trafficRemainder + (Math.max(0, effectiveRate) * Math.max(0, elapsed)) : Number(arrivals);
  const count = Math.max(0, Math.floor(requested));
  for (let i = 0; i < count; i += 1) {
    sequence += 1;
    const result = consumeToken(bucket, { id: `req-${sequence}`, timestamp: nextTime });
    bucket = result.state;
    newEvents.push(result.event);
    if (result.event.status === "accepted") accepted += 1; else rejected += 1;
  }
  return {
    ...simulation,
    status: simulation.status === "running" ? "running" : "paused",
    virtualTime: nextTime,
    requestSequence: sequence,
    trafficRemainder: arrivals == null ? requested - count : simulation.trafficRemainder,
    bucket,
    events: [...simulation.events, ...newEvents].slice(-80),
    metrics: { total: simulation.metrics.total + count, accepted, rejected },
  };
}

export function resetSimulation(config) { return createSimulation(config); }
