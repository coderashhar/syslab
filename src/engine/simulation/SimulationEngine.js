import { consumeToken, createTokenBucket, refillTokenBucket } from "../algorithms/tokenBucket";
import { createLeakyBucket, drainLeakyBucket, enqueueLeakyRequest } from "../algorithms/leakyBucket";
import { getTrafficRate } from "../traffic/trafficPatterns";

export function createSimulation(config = {}) {
  const algorithm = config.algorithm ?? "token-bucket";
  return {
    status: "idle",
    algorithm,
    virtualTime: 0,
    requestSequence: 0,
    trafficRemainder: 0,
    bucket: algorithm === "leaky-bucket" ? createLeakyBucket(config) : createTokenBucket(config),
    events: [],
    metrics: { total: 0, accepted: 0, rejected: 0, queued: 0, processed: 0 },
  };
}

export function advanceSimulation(simulation, { elapsed = 0.5, arrivals, arrivalRate, trafficPattern = "constant", trafficConfig = {} } = {}) {
  const nextTime = Number((simulation.virtualTime + Math.max(0, elapsed)).toFixed(3));
  if (simulation.algorithm === "leaky-bucket") return advanceLeakySimulation(simulation, { elapsed, arrivals, arrivalRate, trafficPattern, trafficConfig, nextTime });
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
    metrics: { ...simulation.metrics, total: simulation.metrics.total + count, accepted, rejected },
  };
}

function advanceLeakySimulation(simulation, { elapsed, arrivals, arrivalRate, trafficPattern, trafficConfig, nextTime }) {
  const drained = drainLeakyBucket(simulation.bucket, nextTime);
  const newEvents = drained.processed.map((request, index) => ({
    id: `processed-${request.id}-${nextTime}-${index}`,
    requestId: request.id,
    timestamp: nextTime,
    type: "REQUEST_PROCESSED",
    status: "processed",
    reason: "The queue drained one request at the configured rate.",
    stateBefore: simulation.bucket,
    stateAfter: drained.state,
  }));
  const effectiveRate = arrivalRate == null ? getTrafficRate(trafficPattern, nextTime, trafficConfig) : arrivalRate;
  const requested = arrivals == null ? simulation.trafficRemainder + (Math.max(0, effectiveRate) * Math.max(0, elapsed)) : Number(arrivals);
  const count = Math.max(0, Math.floor(requested));
  let queue = drained.state;
  let sequence = simulation.requestSequence;
  let accepted = simulation.metrics.accepted;
  let rejected = simulation.metrics.rejected;
  let queued = simulation.metrics.queued;
  for (let i = 0; i < count; i += 1) {
    sequence += 1;
    const result = enqueueLeakyRequest(queue, { id: `req-${sequence}`, timestamp: nextTime });
    queue = result.state;
    newEvents.push(result.event);
    if (result.event.status === "accepted") { accepted += 1; queued += 1; } else rejected += 1;
  }
  return {
    ...simulation,
    status: simulation.status === "running" ? "running" : "paused",
    virtualTime: nextTime,
    requestSequence: sequence,
    trafficRemainder: arrivals == null ? requested - count : simulation.trafficRemainder,
    bucket: queue,
    events: [...simulation.events, ...newEvents].slice(-80),
    metrics: { ...simulation.metrics, total: simulation.metrics.total + count, accepted, rejected, queued, processed: simulation.metrics.processed + drained.processed.length },
  };
}

export function resetSimulation(config) { return createSimulation(config); }
