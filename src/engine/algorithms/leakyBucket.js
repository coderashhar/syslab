export function createLeakyBucket(config = {}) {
  const capacity = Math.max(1, Number(config.queueCapacity ?? 8));
  const processingRate = Math.max(0, Number(config.processingRate ?? 2));
  const initialQueue = Math.min(capacity, Math.max(0, Math.floor(Number(config.initialQueue ?? 0))));
  return {
    capacity,
    processingRate,
    queue: Array.from({ length: initialQueue }, (_, index) => ({ id: `initial-${index + 1}`, arrivedAt: 0 })),
    serviceRemainder: 0,
  };
}

export function drainLeakyBucket(state, timestamp) {
  const elapsed = Math.max(0, timestamp - (state.lastProcessedAt ?? 0));
  const available = state.serviceRemainder + (elapsed * state.processingRate);
  const count = Math.min(state.queue.length, Math.floor(available));
  const processed = state.queue.slice(0, count);
  return {
    state: {
      ...state,
      queue: state.queue.slice(count),
      serviceRemainder: available - count,
      lastProcessedAt: timestamp,
    },
    processed,
  };
}

export function enqueueLeakyRequest(state, { id, timestamp }) {
  if (state.queue.length >= state.capacity) {
    return {
      state,
      event: {
        id: `evt-${id}-${timestamp}-overflow`,
        requestId: id,
        timestamp,
        type: "QUEUE_OVERFLOW",
        status: "rejected",
        reason: "The queue is full.",
        stateBefore: state,
        stateAfter: state,
      },
    };
  }
  const next = { ...state, queue: [...state.queue, { id, arrivedAt: timestamp }] };
  return {
    state: next,
    event: {
      id: `evt-${id}-${timestamp}-queued`,
      requestId: id,
      timestamp,
      type: "REQUEST_QUEUED",
      status: "accepted",
      reason: "The request entered the queue.",
      stateBefore: state,
      stateAfter: next,
    },
  };
}

export function leakyBucketSnapshot(state) {
  return { queueLength: state.queue.length, capacity: state.capacity, processingRate: state.processingRate };
}
