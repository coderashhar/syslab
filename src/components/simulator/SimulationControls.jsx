"use client";

import { Pause, Play, RotateCcw, SkipForward, Zap } from "lucide-react";

export default function SimulationControls({ running, run, pause, reset, step, burst }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><button className="btn-primary" onClick={running ? pause : run}>{running ? <Pause size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} /> : <Play size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />}{running ? "Pause" : "Start"}</button><button className="btn-secondary" onClick={() => step({ elapsed: 1 })} aria-label="Step forward one second" title="Advance the virtual clock by one second"><SkipForward size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Step +1s</button><button className="btn-secondary" onClick={() => burst(6)}><Zap size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Generate burst</button><button className="icon-btn" onClick={reset} aria-label="Reset simulation" title="Reset simulation"><RotateCcw size={16} /></button></div>;
}
