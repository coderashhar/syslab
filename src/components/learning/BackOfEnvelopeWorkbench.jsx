"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { backOfEnvelopeScenarios, formatNumber } from "@/data/backOfEnvelope";

const initialValues = Object.fromEntries(backOfEnvelopeScenarios[0].fields.map((field) => [field.key, field.value]));

export default function BackOfEnvelopeWorkbench() {
  const [scenarioId, setScenarioId] = useState(backOfEnvelopeScenarios[0].id);
  const [values, setValues] = useState(initialValues);
  const [estimate, setEstimate] = useState("");
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const scenario = backOfEnvelopeScenarios.find((item) => item.id === scenarioId) ?? backOfEnvelopeScenarios[0];
  const result = useMemo(() => scenario.calculate(values), [scenario, values]);
  const estimateNumber = Number(estimate);
  const isClose = Number.isFinite(estimateNumber) && estimateNumber > 0 && Math.abs(estimateNumber - result.answer) / result.answer <= 0.2;

  function selectScenario(event) {
    const next = backOfEnvelopeScenarios.find((item) => item.id === event.target.value);
    setScenarioId(next.id);
    setValues(Object.fromEntries(next.fields.map((field) => [field.key, field.value])));
    setEstimate("");
    setChecked(false);
    setShowSolution(false);
  }

  function resetScenario() {
    setValues(Object.fromEntries(scenario.fields.map((field) => [field.key, field.value])));
    setEstimate("");
    setChecked(false);
    setShowSolution(false);
  }

  return (
    <div className="boe-workbench">
      <div className="boe-toolbar">
        <label className="boe-select-wrap">
          <span className="eyebrow">Choose a scenario</span>
          <span className="boe-select-control"><select value={scenario.id} onChange={selectScenario}>{backOfEnvelopeScenarios.map((item) => <option key={item.id} value={item.id}>{item.category} · {item.title}</option>)}</select><ChevronDown size={15} /></span>
        </label>
        <button className="icon-btn" type="button" onClick={resetScenario} aria-label="Reset scenario" title="Reset scenario"><RotateCcw size={15} /></button>
      </div>

      <div className="boe-grid">
        <section className="boe-assumptions">
          <div className="eyebrow">1 · Set your anchors</div>
          <h3>{scenario.prompt}</h3>
          <p className="muted boe-helper">Use round numbers that are easy to multiply. Precision comes later.</p>
          <div className="boe-fields">
            {scenario.fields.map((field) => <label key={field.key} className="boe-field"><span>{field.label}</span><input className="input" type="number" min={field.min} step={field.step} value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: Number(event.target.value) }))} /></label>)}
          </div>
        </section>

        <section className="boe-challenge">
          <div className="eyebrow">2 · Make the estimate</div>
          <h3>What is your answer?</h3>
          <p className="muted boe-helper">Write the rough result first. Being within 20% counts as a strong estimate.</p>
          <div className="boe-answer-input"><input className="input" type="number" min="0" step="any" placeholder="e.g. 7,000" value={estimate} onChange={(event) => { setEstimate(event.target.value); setChecked(false); }} /><span>{scenario.answerUnit}</span></div>
          <button className="btn-primary boe-check" type="button" onClick={() => { setChecked(true); setShowSolution(true); }} disabled={!estimate}>Check estimate</button>
          {checked && <div className={`boe-feedback ${isClose ? "boe-feedback-good" : "boe-feedback-near"}`}><span className="boe-feedback-icon">{isClose ? <Check size={15} /> : <Sparkles size={15} />}</span><div><strong>{isClose ? "Good estimate." : "Useful first pass."}</strong><span>{isClose ? "Your order of magnitude is on target." : "Compare the steps below and see which assumption moved the answer."}</span></div></div>}
        </section>
      </div>

      <section className="boe-solution">
        <button className="boe-solution-toggle" type="button" onClick={() => setShowSolution((open) => !open)} aria-expanded={showSolution}><span><span className="eyebrow">3 · Show the math</span><strong>Build the estimate step by step</strong></span><ChevronDown size={18} className={showSolution ? "boe-chevron-open" : ""} /></button>
        {showSolution && <div className="boe-solution-body"><div className="boe-result"><span className="muted">Reference estimate</span><strong>{formatNumber(result.answer, result.answer < 10 ? 2 : 1)}</strong><span className="muted">{scenario.answerUnit}</span></div><div className="boe-steps">{result.steps.map((step, index) => <div key={step} className="boe-step"><span>{index + 1}</span><p>{step}</p></div>)}</div></div>}
      </section>
    </div>
  );
}
