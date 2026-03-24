import React, { useState, useMemo } from "react";
import "./triage.css";

const DEFAULT_SYMPTOMS = [
  "Headache",
  "Weakness",
  "Numbness",
  "Vision changes",
  "Speech difficulty",
  "Seizure",
  "Dizziness",
  "Loss of consciousness",
];

export default function Triage() {
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [duration, setDuration] = useState<string>("0");
  const [durationUnit, setDurationUnit] = useState<string>("days");
  const [onset, setOnset] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [flags, setFlags] = useState<Record<string, boolean>>({
    pregnancy: false,
    cancer_treatment: false,
  });

  const [symptoms] = useState<string[]>(DEFAULT_SYMPTOMS);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => symptoms.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
    [symptoms, search]
  );

  const toggleSymptom = (s: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const incrementDuration = (delta: number) => {
    setDuration((d) => {
      const n = Math.max(0, Math.min(99, Number(d || 0) + delta));
      return String(n);
    });
  };

  const resetForm = () => {
    setAge("");
    setSex("");
    setDuration("0");
    setDurationUnit("days");
    setOnset("");
    setNotes("");
    setFlags({ pregnancy: false, cancer_treatment: false });
    setSelected(new Set());
    setSearch("");
  };

  const [result, setResult] = useState<{ label: string; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = selected.size;
    let label = "LOW";
    let text = "Routine outpatient follow-up recommended.";
    if (count >= 3) {
      label = "MOD";
      text = "Moderate concern — consider prompt evaluation.";
    }
    if (selected.has("Loss of consciousness") || onset === "sudden") {
      label = "HIGH";
      text = "Immediate attention recommended — escalate to emergency services.";
    }
    setResult({ label, text });
    // persist minimal form to sessionStorage for the results view
    const payload = {
      age,
      sex,
      duration: `${duration} ${durationUnit}`,
      onset,
      symptoms: Array.from(selected),
      notes,
    };
    try {
      sessionStorage.setItem("assessmentData", JSON.stringify(payload));
    } catch {}
    // navigate to results page if the app expects it
    // window.location.href = "../results/index.html";
  };

  return (
    <div className="container">
      <header>
        <div className="badge">NeuroFIRST · Clinical Tool</div>
        <h1>
          NeuroFIRST <em>Triage</em> Tool
        </h1>
        <p className="subtitle">
          Enter patient demographics and select all presenting neurological symptoms to support triage evaluation.
        </p>
      </header>

      <form id="assessmentForm" onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ animationDelay: "0.05s" }}>
          <div className="card-header">
            <div className="card-icon icon-blue">👤</div>
            <div>
              <div className="card-title">Patient Information</div>
              <div className="card-desc">Basic demographic details</div>
            </div>
          </div>

          <div className="fields-row">
            <div className="field">
              <label htmlFor="age">
                Patient Age <span className="required-star">*</span>
              </label>
              <input type="number" id="age" name="age" placeholder="e.g. 54" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="sex">Biological Sex</label>
              <select id="sex" name="sex" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="" disabled>Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Not specified</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="symptom_duration">
                Symptom Duration <span className="required-star">*</span>
              </label>
              <div className="unit-row">
                <button type="button" className="stepper-btn" id="durationMinus" onClick={() => incrementDuration(-1)}>−</button>
                <input type="text" inputMode="numeric" maxLength={2} id="symptom_duration" name="symptom_duration" placeholder="0" value={duration} onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))} />
                <button type="button" className="stepper-btn" id="durationPlus" onClick={() => incrementDuration(1)}>+</button>
                <select className="unit-select" id="duration_unit" name="duration_unit" value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)}>
                  <option value="hours">hrs</option>
                  <option value="days">days</option>
                  <option value="weeks">wks</option>
                  <option value="months">mos</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="onset">Symptom Onset</label>
              <select id="onset" name="onset" value={onset} onChange={(e) => setOnset(e.target.value)}>
                <option value="" disabled>Select…</option>
                <option value="sudden">Sudden / Abrupt</option>
                <option value="rapid">Rapid (minutes–hours)</option>
                <option value="gradual">Gradual (days–weeks)</option>
                <option value="fluctuating">Fluctuating</option>
              </select>
            </div>
          </div>

          <div className="flags-label">Clinical Flags</div>
          <div className="flags-row">
            <div className="symptom-item">
              <input type="checkbox" id="flag_pregnancy" name="flags" checked={flags.pregnancy} onChange={(e) => setFlags((f) => ({ ...f, pregnancy: e.target.checked }))} />
              <label htmlFor="flag_pregnancy">
                <div className="check-box" />
                <div className="symptom-label-content">
                  <span className="symptom-name">Pregnant</span>
                  <span className="symptom-detail">Current or suspected pregnancy</span>
                </div>
              </label>
            </div>

            <div className="symptom-item">
              <input type="checkbox" id="flag_cancer" name="flags" checked={flags.cancer_treatment} onChange={(e) => setFlags((f) => ({ ...f, cancer_treatment: e.target.checked }))} />
              <label htmlFor="flag_cancer">
                <div className="check-box" />
                <div className="symptom-label-content">
                  <span className="symptom-name">Undergoing Cancer Treatment</span>
                  <span className="symptom-detail">Active chemotherapy or immunosuppression</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="card" style={{ animationDelay: "0.15s" }}>
          <div className="card-header">
            <div className="card-icon icon-warn">🧠</div>
            <div>
              <div className="card-title">Neurological Symptoms</div>
              <div className="card-desc">Select all symptoms currently present</div>
            </div>
          </div>

          <input type="text" id="symptomSearch" className="symptom-search" placeholder="Search Symptoms…" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} />

          <div className="symptom-grid" id="symptomGrid">
            {filtered.map((s) => (
              <div className="symptom-item" key={s}>
                <input
                  type="checkbox"
                  id={`sym_${s}`}
                  checked={selected.has(s)}
                  onChange={() => toggleSymptom(s)}
                />
                <label htmlFor={`sym_${s}`}>
                  <div className="check-box" />
                  <div className="symptom-label-content">
                    <span className="symptom-name">{s}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="symptom-count">
            <span className="count-pill" id="countPill">{selected.size}</span>
            <span>symptom(s) selected</span>
          </div>
        </div>

        <div className="card" style={{ animationDelay: "0.25s" }}>
          <div className="card-header">
            <div className="card-icon icon-red">📋</div>
            <div>
              <div className="card-title">Clinical Notes</div>
              <div className="card-desc">Additional context for the evaluating clinician</div>
            </div>
          </div>
          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" placeholder="e.g. relevant medical history, current medications, recent trauma, pertinent negatives…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="submit-row">
          <button type="button" className="reset-btn" id="resetBtn" onClick={resetForm}>Clear Form</button>
          <button type="submit" className="submit-btn">Run Assessment →</button>
        </div>
      </form>

      <div className="result-banner" id="resultBanner" style={{ display: result ? "block" : "none" }}>
        <div className="result-label" id="resultLabel">{result?.label}</div>
        <div className="result-text" id="resultText">{result?.text}</div>
      </div>
    </div>
  );
}
