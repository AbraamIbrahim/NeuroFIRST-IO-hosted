import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./triage.css";

interface SymptomEntry {
  id: string;
  name: string;
  detail: string;
  severity: "high" | "med" | "minor";
  severityLabel: string;
  category: string;
}

const SYMPTOMS_DATA: SymptomEntry[] = [
  // Critical
  { id: 's01', name: 'Sudden Hemiparesis',        detail: 'Acute one-sided motor weakness; suspect stroke until proven otherwise',               severity: 'high',  severityLabel: 'Critical', category: 'Motor'       },
  { id: 's02', name: 'Rapid Ascending Paralysis', detail: 'Progressive weakness moving upward; classic Guillain-Barré presentation',             severity: 'high',  severityLabel: 'Critical', category: 'Motor'       },
  { id: 's03', name: 'Thunderclap Headache',      detail: 'Worst headache of life at peak intensity; rule out subarachnoid hemorrhage',           severity: 'high',  severityLabel: 'Critical', category: 'Headache'    },
  { id: 's04', name: 'Saddle Anesthesia',         detail: 'Perineal numbness; cauda equina syndrome until proven otherwise',                      severity: 'high',  severityLabel: 'Critical', category: 'Sensory'     },
  { id: 's05', name: 'Aphasia',                   detail: 'Sudden language impairment (expressive or receptive); stroke indicator',               severity: 'high',  severityLabel: 'Critical', category: 'Cognitive'   },
  { id: 's06', name: 'Sudden Delirium',           detail: 'Acute confusion with fluctuating consciousness; broad differential including sepsis',  severity: 'high',  severityLabel: 'Critical', category: 'Cognitive'   },
  { id: 's07', name: 'Status Epilepticus',        detail: 'Continuous or repetitive seizure activity lasting >5 minutes',                        severity: 'high',  severityLabel: 'Critical', category: 'Seizure'     },
  { id: 's08', name: 'Sudden Vision Loss',        detail: 'Monocular or binocular visual loss; CRAO or posterior circulation stroke',             severity: 'high',  severityLabel: 'Critical', category: 'Vision'      },
  { id: 's09', name: 'Acute Ataxia',              detail: 'Sudden loss of coordination; cerebellar stroke or hemorrhage',                        severity: 'high',  severityLabel: 'Critical', category: 'Coordination'},
  // Moderate
  { id: 's10', name: 'Muscle Rigidity',           detail: "Increased tone with cogwheel or lead-pipe quality; Parkinson's or drug-induced",      severity: 'med',   severityLabel: 'Moderate', category: 'Motor'       },
  { id: 's11', name: 'Progressive Weakness',      detail: 'Gradual bilateral or proximal limb weakness over weeks to months',                    severity: 'med',   severityLabel: 'Moderate', category: 'Motor'       },
  { id: 's12', name: 'Chronic Neuropathy',        detail: 'Distal sensory loss in glove-and-stocking distribution; systemic cause likely',       severity: 'med',   severityLabel: 'Moderate', category: 'Sensory'     },
  { id: 's13', name: 'Classic Migraine',          detail: 'Pulsating unilateral headache with aura, nausea, and photophobia',                   severity: 'med',   severityLabel: 'Moderate', category: 'Headache'    },
  { id: 's14', name: 'Progressive Memory Loss',   detail: 'Declining episodic memory affecting daily function; dementia workup warranted',       severity: 'med',   severityLabel: 'Moderate', category: 'Cognitive'   },
  { id: 's15', name: 'Chronic Vertigo',           detail: 'Persistent rotational sensation; central vs. peripheral cause requires evaluation',   severity: 'med',   severityLabel: 'Moderate', category: 'Coordination'},
  { id: 's16', name: 'Double Vision',             detail: 'Binocular diplopia; cranial nerve palsy or brainstem lesion',                         severity: 'med',   severityLabel: 'Moderate', category: 'Vision'      },
  // Minor
  { id: 's17', name: 'Benign Fasciculations',     detail: 'Involuntary muscle twitches without weakness; typically benign if isolated',           severity: 'minor', severityLabel: 'Minor',    category: 'Motor'       },
  { id: 's18', name: 'Essential Tremor',          detail: 'Action tremor of hands; worsens with intentional movement, improves at rest',         severity: 'minor', severityLabel: 'Minor',    category: 'Motor'       },
  { id: 's19', name: 'Transient Numbness',        detail: 'Brief, fleeting paresthesias without a clear dermatomal pattern',                     severity: 'minor', severityLabel: 'Minor',    category: 'Sensory'     },
  { id: 's20', name: 'Tension Headache',          detail: 'Bilateral pressure-type headache without nausea or aura',                             severity: 'minor', severityLabel: 'Minor',    category: 'Headache'    },
  { id: 's21', name: 'Age-Related Lapses',        detail: 'Mild forgetfulness consistent with normal cognitive aging',                            severity: 'minor', severityLabel: 'Minor',    category: 'Cognitive'   },
  { id: 's22', name: 'Occasional Dizziness',      detail: 'Intermittent lightheadedness or unsteadiness without a positional trigger',           severity: 'minor', severityLabel: 'Minor',    category: 'Coordination'},
  { id: 's23', name: 'Tinnitus',                  detail: 'Perceived ringing or buzzing without external sound; often benign',                   severity: 'minor', severityLabel: 'Minor',    category: 'Other'       },
];

const SYMPTOM_BY_NAME = new Map(SYMPTOMS_DATA.map((symptom) => [symptom.name, symptom]));

// Calculate the Levenshtein distance between two strings.
// This measures the minimum number of single-character edits (insertions, deletions, or substitutions)
// required to change one string into another. Used for fuzzy matching to handle typos.
function calculateLevenshteinDistance(firstString: string, secondString: string): number {
  // Create a 2D matrix to store distances between substrings
  const distanceMatrix: number[][] = [];
  
  // Initialize the matrix with base cases
  for (let rowIndex = 0; rowIndex <= secondString.length; rowIndex++) {
    distanceMatrix[rowIndex] = [rowIndex]; // Distance from empty string to secondString[0..rowIndex]
  }
  for (let columnIndex = 0; columnIndex <= firstString.length; columnIndex++) {
    distanceMatrix[0][columnIndex] = columnIndex; // Distance from firstString[0..columnIndex] to empty string
  }
  
  // Fill the matrix using dynamic programming
  for (let rowIndex = 1; rowIndex <= secondString.length; rowIndex++) {
    for (let columnIndex = 1; columnIndex <= firstString.length; columnIndex++) {
      if (secondString.charAt(rowIndex - 1) === firstString.charAt(columnIndex - 1)) {
        // Characters match, no edit needed
        distanceMatrix[rowIndex][columnIndex] = distanceMatrix[rowIndex - 1][columnIndex - 1];
      } else {
        // Characters don't match, take minimum of three possible edits:
        // 1. Substitution: replace char in firstString with char in secondString
        // 2. Insertion: insert char from secondString into firstString
        // 3. Deletion: delete char from firstString
        distanceMatrix[rowIndex][columnIndex] = Math.min(
          distanceMatrix[rowIndex - 1][columnIndex - 1] + 1, // substitution
          distanceMatrix[rowIndex][columnIndex - 1] + 1,     // insertion
          distanceMatrix[rowIndex - 1][columnIndex] + 1      // deletion
        );
      }
    }
  }
  
  // The bottom-right cell contains the Levenshtein distance
  return distanceMatrix[secondString.length][firstString.length];
}

// Check if the search query matches a target string, either exactly as substring or fuzzily.
// This allows for typos and partial matches in the symptom search.
function doesSearchMatchTarget(searchQuery: string, targetText: string): boolean {
  const normalizedSearch = searchQuery.toLowerCase();
  const normalizedTarget = targetText.toLowerCase();
  
  // First check: exact substring match (case-insensitive)
  const isSubstringMatch = normalizedTarget.includes(normalizedSearch);
  
  // Second check: fuzzy match using Levenshtein distance
  // Only apply fuzzy matching for searches longer than 2 characters to avoid false positives
  // Allow up to 2 edits, or fewer edits proportional to search length (max 2)
  const isFuzzyMatch = normalizedSearch.length > 2 && 
    calculateLevenshteinDistance(normalizedSearch, normalizedTarget) <= Math.min(2, Math.floor(normalizedSearch.length / 3));
  
  return isSubstringMatch || isFuzzyMatch;
}

function toBackendSex(value: string): "Male" | "Female" | "Other" {
  if (value === "male") return "Male";
  if (value === "female") return "Female";
  return "Other";
}

function toBackendOnset(value: string): "Sudden" | "Rapid" | "Gradual" | "Fluctuating" {
  if (value === "sudden") return "Sudden";
  if (value === "rapid") return "Rapid";
  if (value === "gradual") return "Gradual";
  return "Fluctuating";
}

function toBackendDurationUnit(value: string): "min" | "hrs" | "days" | "wks" | "mos" {
  if (value === "hours") return "hrs";
  if (value === "weeks") return "wks";
  if (value === "months") return "mos";
  return "days";
}

interface ResultsState {
  age: string;
  sex: string;
  duration: string;
  onset: string;
  symptoms: string[];
  notes: string;
  apiAssessment: {
    age: number;
    sex: "Male" | "Female" | "Other";
    symptom_duration_num: number;
    symptom_duration_qualifier: "min" | "hrs" | "days" | "wks" | "mos";
    symptom_onset: "Sudden" | "Rapid" | "Gradual" | "Fluctuating";
    symptoms: string[];
    notes: string;
  };
}

export default function Triage() {
  const navigate = useNavigate();
  const [age, setAge] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [duration, setDuration] = useState<string>("0");
  const [durationUnit, setDurationUnit] = useState<string>("days");
  const [onset, setOnset] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [flags, setFlags] = useState<Record<string, boolean | string>>({
    pregnancy: false,
    cancer_treatment: false,
    previously_seen_neurologist: false,
    symptoms_worsened: "",
  });

  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filter symptoms based on search query using fuzzy matching
  // This allows users to find symptoms even with typos or partial input
  const filteredSymptoms = useMemo(
    () => SYMPTOMS_DATA.filter((symptom) =>
      doesSearchMatchTarget(search, symptom.name) ||
      doesSearchMatchTarget(search, symptom.detail) ||
      doesSearchMatchTarget(search, symptom.category)
    ),
    [search]
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
    setFlags({ pregnancy: false, cancer_treatment: false, previously_seen_neurologist: false, symptoms_worsened: "" });
    setSelected(new Set());
    setSearch("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const selectedSymptoms = Array.from(selected);
    const payload: ResultsState = {
      age,
      sex,
      duration: `${duration} ${durationUnit}`,
      onset,
      symptoms: selectedSymptoms,
      notes,
      apiAssessment: {
        age: Number(age || 0),
        sex: toBackendSex(sex),
        symptom_duration_num: Number(duration || 0),
        symptom_duration_qualifier: toBackendDurationUnit(durationUnit),
        symptom_onset: toBackendOnset(onset),
        symptoms: selectedSymptoms.map((name) => SYMPTOM_BY_NAME.get(name)?.id).filter(Boolean) as string[],
        notes,
      },
    };
    try {
      sessionStorage.setItem("assessmentData", JSON.stringify(payload));
    } catch {}
    navigate("/results", { state: payload });
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
              <input type="checkbox" id="flag_pregnancy" name="flags" checked={!!flags.pregnancy} onChange={(e) => setFlags((f) => ({ ...f, pregnancy: e.target.checked }))} />
              <label htmlFor="flag_pregnancy">
          <div className="check-box" />
          <div className="symptom-label-content">
            <span className="symptom-name">Pregnant</span>
            <span className="symptom-detail">Current or suspected pregnancy</span>
          </div>
              </label>
            </div>

            <div className="flag-group">
              <div className="symptom-item">
                <input type="checkbox" id="flag_neurologist" name="flags" checked={!!flags.previously_seen_neurologist} onChange={(e) => setFlags((f) => ({ ...f, previously_seen_neurologist: e.target.checked, ...(e.target.checked ? {} : { symptoms_worsened: "" }) }))} />
                <label htmlFor="flag_neurologist">
                  <div className="check-box" />
                  <div className="symptom-label-content">
                    <span className="symptom-name">Previously Seen by Neurologist</span>
                    <span className="symptom-detail">Patient has had a neurological evaluation</span>
                  </div>
                </label>
              </div>
              {flags.previously_seen_neurologist && (
                <div className="flag-sub-field">
                  <label htmlFor="symptoms_worsened">Have symptoms worsened since?</label>
                  <select id="symptoms_worsened" name="symptoms_worsened" value={String(flags.symptoms_worsened || "")} onChange={(e) => setFlags((f) => ({ ...f, symptoms_worsened: e.target.value }))}>
                    <option value="" disabled>Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              )}
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
            {filteredSymptoms.map((symptom) => (
              <div className="symptom-item" key={symptom.id}>
                <input
                  type="checkbox"
                  id={`sym_${symptom.id}`}
                  checked={selected.has(symptom.name)}
                  onChange={() => toggleSymptom(symptom.name)}
                />
                <label htmlFor={`sym_${symptom.id}`}>
                  <div className="check-box" />
                  <div className="symptom-label-content">
                    <span className="symptom-name">{symptom.name}</span>
                    <span className="symptom-detail">{symptom.detail}</span>
                    <span className={`sev sev-${symptom.severity}`}>{symptom.severityLabel}</span>
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
    </div>
  );
}
