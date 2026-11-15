export function createSlidingWindowCounter(config = {}) {
  const limit = Math.max(1, Math.floor(Number(config.limit ?? 5)));
  const windowSize = Math.max(1, Number(config.windowSize ?? 10));
  const startAt = Math.max(0, Number(config.startAt ?? 0));
  const currentWindowStart = Math.floor(startAt / windowSize) * windowSize;
  return { limit, windowSize, currentWindowStart, currentCount: 0, previousCount: 0 };
}

export function syncSlidingWindowCounter(state, timestamp) {
  const currentWindowStart = Math.floor(Math.max(0, timestamp) / state.windowSize) * state.windowSize;
  if (currentWindowStart === state.currentWindowStart) return { state, shifted: false };
  const windowsPassed = Math.round((currentWindowStart - state.currentWindowStart) / state.windowSize);
  return {
    state: {
      ...state,
      currentWindowStart,
      currentCount: 0,
      previousCount: windowsPassed === 1 ? state.currentCount : 0,
    },
    shifted: true,
  };
}

export function weightedSlidingCount(state, timestamp) {
  const synced = syncSlidingWindowCounter(state, timestamp).state;
  const elapsed = Math.max(0, timestamp - synced.currentWindowStart);
  const previousWeight = Math.max(0, 1 - (elapsed / synced.windowSize));
  return { count: synced.currentCount + (synced.previousCount * previousWeight), previousWeight, state: synced };
}

export function consumeSlidingWindowCounter(state, { id, timestamp }) {
  const weighted = weightedSlidingCount(state, timestamp);
  const accepted = weighted.count < weighted.state.limit;
  const next = accepted ? { ...weighted.state, currentCount: weighted.state.currentCount + 1 } : weighted.state;
  return {
    state: next,
    event: {
      id: `evt-${id}-${timestamp}`,
      requestId: id,
      timestamp,
      type: accepted ? "REQUEST_ACCEPTED" : "REQUEST_REJECTED",
      status: accepted ? "accepted" : "rejected",
      reason: accepted ? `Estimated count is ${weighted.count.toFixed(2)} of ${weighted.state.limit}.` : `Estimated count is ${weighted.count.toFixed(2)}; the limit is ${weighted.state.limit}.`,
      stateBefore: weighted.state,
      stateAfter: next,
    },
  };
}

export function slidingWindowCounterSnapshot(state, timestamp = state.currentWindowStart) {
  const weighted = weightedSlidingCount(state, timestamp);
  return { currentCount: weighted.state.currentCount, previousCount: weighted.state.previousCount, weightedCount: Number(weighted.count.toFixed(3)), previousWeight: Number(weighted.previousWeight.toFixed(3)), limit: state.limit, windowSize: state.windowSize };
}
