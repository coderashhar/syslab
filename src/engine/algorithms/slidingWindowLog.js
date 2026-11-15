export function createSlidingWindowLog(config = {}) {
  const limit = Math.max(1, Math.floor(Number(config.limit ?? 5)));
  const windowSize = Math.max(1, Number(config.windowSize ?? 10));
  return { limit, windowSize, timestamps: [] };
}

export function pruneSlidingWindow(state, timestamp) {
  const cutoff = Number((timestamp - state.windowSize).toFixed(6));
  const timestamps = state.timestamps.filter((value) => value > cutoff);
  return { state: timestamps.length === state.timestamps.length ? state : { ...state, timestamps }, removed: state.timestamps.length - timestamps.length };
}

export function consumeSlidingWindow(state, { id, timestamp }) {
  const pruned = pruneSlidingWindow(state, timestamp);
  const accepted = pruned.state.timestamps.length < pruned.state.limit;
  const next = accepted ? { ...pruned.state, timestamps: [...pruned.state.timestamps, timestamp] } : pruned.state;
  return {
    state: next,
    removed: pruned.removed,
    event: {
      id: `evt-${id}-${timestamp}`,
      requestId: id,
      timestamp,
      type: accepted ? "REQUEST_ACCEPTED" : "REQUEST_REJECTED",
      status: accepted ? "accepted" : "rejected",
      reason: accepted ? `Stored timestamp ${timestamp.toFixed(1)}s in the log.` : "The rolling window already contains its limit.",
      stateBefore: pruned.state,
      stateAfter: next,
    },
  };
}

export function slidingWindowLogSnapshot(state) {
  return { count: state.timestamps.length, limit: state.limit, windowSize: state.windowSize, timestamps: [...state.timestamps] };
}
