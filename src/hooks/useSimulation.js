"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { advanceSimulation, createSimulation, resetSimulation } from "@/engine/simulation/SimulationEngine";

function reducer(state, action) {
  switch (action.type) {
    case "RUN": return { ...state, status: "running" };
    case "PAUSE": return { ...state, status: "paused" };
    case "RESET": return resetSimulation(action.config);
    case "STEP": return advanceSimulation(state, action.options);
    case "BURST": return advanceSimulation(state, { elapsed: 0.1, arrivals: action.count });
    default: return state;
  }
}

export function useSimulation(config) {
  const [state, dispatch] = useReducer(reducer, config, createSimulation);
  const step = useCallback((options) => dispatch({ type: "STEP", options }), []);
  const reset = useCallback(() => dispatch({ type: "RESET", config }), [config]);
  const run = useCallback(() => dispatch({ type: "RUN" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const burst = useCallback((count = 6) => dispatch({ type: "BURST", count }), []);

  useEffect(() => {
    dispatch({ type: "RESET", config });
  }, [config.capacity, config.refillRate, config.initialTokens, config.requestRate]);

  useEffect(() => {
    if (state.status !== "running") return undefined;
    const timer = window.setInterval(() => step({ elapsed: 0.5, arrivalRate: config.requestRate }), 650);
    return () => window.clearInterval(timer);
  }, [state.status, step, config.requestRate]);

  const derived = useMemo(() => ({ acceptanceRate: state.metrics.total ? (state.metrics.accepted / state.metrics.total) * 100 : 0, fillPercent: (state.bucket.tokens / state.bucket.capacity) * 100 }), [state]);
  return { state, derived, step, reset, run, pause, burst };
}
