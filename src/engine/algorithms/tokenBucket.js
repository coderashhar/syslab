export function createTokenBucket(config = {}) {
  const capacity = Math.max(1, Number(config.capacity ?? 10));
  const refillRate = Math.max(0, Number(config.refillRate ?? 2));
  const initialTokens = Math.min(capacity, Math.max(0, Number(config.initialTokens ?? capacity)));
  return { capacity, refillRate, tokens: initialTokens, lastRefillAt: 0 };
}

export function refillTokenBucket(state, timestamp) {
  const elapsed = Math.max(0, timestamp - state.lastRefillAt);
  const tokens = Math.min(state.capacity, state.tokens + elapsed * state.refillRate);
  return { ...state, tokens, lastRefillAt: timestamp };
}

export function consumeToken(state, { id, timestamp }) {
  const current = refillTokenBucket(state, timestamp);
  const accepted = current.tokens >= 1;
  const next = accepted ? { ...current, tokens: current.tokens - 1 } : current;
  return {
    state: next,
    event: {
      id: `evt-${id}-${timestamp}`,
      requestId: id,
      timestamp,
      type: accepted ? "REQUEST_ACCEPTED" : "REQUEST_REJECTED",
      status: accepted ? "accepted" : "rejected",
      reason: accepted ? "A token was available." : "The bucket is empty.",
      stateBefore: current,
      stateAfter: next,
    },
  };
}

export function tokenBucketSnapshot(state) {
  return { tokens: Number(state.tokens.toFixed(3)), capacity: state.capacity, refillRate: state.refillRate };
}
