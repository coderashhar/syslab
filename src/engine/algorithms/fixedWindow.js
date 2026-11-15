export function createFixedWindow(config = {}) {
  const limit = Math.max(1, Math.floor(Number(config.limit ?? 5)));
  const windowSize = Math.max(1, Number(config.windowSize ?? 10));
  const startAt = Math.max(0, Number(config.startAt ?? 0));
  const windowStart = Math.floor(startAt / windowSize) * windowSize;
  return { limit, windowSize, windowStart, count: 0 };
}

export function syncFixedWindow(state, timestamp) {
  const windowStart = Math.floor(Math.max(0, timestamp) / state.windowSize) * state.windowSize;
  if (windowStart === state.windowStart) return { state, reset: false };
  return { state: { ...state, windowStart, count: 0 }, reset: true };
}

export function consumeFixedWindow(state, { id, timestamp }) {
  const synced = syncFixedWindow(state, timestamp);
  const accepted = synced.state.count < synced.state.limit;
  const next = accepted ? { ...synced.state, count: synced.state.count + 1 } : synced.state;
  return {
    state: next,
    reset: synced.reset,
    event: {
      id: `evt-${id}-${timestamp}`,
      requestId: id,
      timestamp,
      type: accepted ? "REQUEST_ACCEPTED" : "REQUEST_REJECTED",
      status: accepted ? "accepted" : "rejected",
      reason: accepted ? `Request ${next.count} of ${next.limit} in this window.` : "The current window is at its limit.",
      stateBefore: synced.state,
      stateAfter: next,
    },
  };
}

export function fixedWindowSnapshot(state) {
  return { count: state.count, limit: state.limit, windowStart: state.windowStart, windowSize: state.windowSize };
}
