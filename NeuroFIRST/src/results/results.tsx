import { useEffect, useState } from "react";
import "./results.css";

// ── Types ──────────────────────────────────────────────────────────────────

type UrgencyLevel = "high" | "med" | "minor";

interface PatientData {
  age?: string;
  sex?: string;
  duration?: string;
  onset?: string;
  symptoms?: string[];
  notes?: string;
}

interface UrgencyState {
  level: string;
  icon: string;
  title: string;
  rec: string;
  ringClass: string;
  bannerClass: string;
  recLabelColor: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const URGENCY_STATES: Record<UrgencyLevel, UrgencyState> = {
  high: {
    level: "HIGH",
    icon: "🚨",
    title: "Immediate Attention Required",
    rec: "Patient presents with indicators consistent with a high-urgency neurological event. Recommend immediate evaluation by attending neurologist. Do not delay workup pending further observation.",
    ringClass: "ring-high",
    bannerClass: "banner-high",
    recLabelColor: "#ef5350",
  },
  med: {
    level: "MOD",
    icon: "⚠️",
    title: "Prompt Evaluation Recommended",
    rec: "Patient presents with moderate-urgency indicators. Schedule evaluation within 24–48 hours. Monitor for symptom escalation and advise the patient to seek emergency care if symptoms worsen.",
    ringClass: "ring-med",
    bannerClass: "banner-med",
    recLabelColor: "#ff9800",
  },
  minor: {
    level: "LOW",
    icon: "ℹ️",
    title: "Routine Follow-Up Suggested",
    rec: "Symptoms appear minor and non-urgent. Recommend routine outpatient follow-up. Patient should be advised to monitor symptoms and return if new or worsening neurological signs develop.",
    ringClass: "ring-minor",
    bannerClass: "banner-minor",
    recLabelColor: "#2196f3",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Read patient data from sessionStorage (set by the assessment form). */
function loadPatientData(): PatientData {
  try {
    const raw = sessionStorage.getItem("assessmentData");
    return raw ? (JSON.parse(raw) as PatientData) : {};
  } catch {
    return {};
  }
}

/** Derive urgency level from patient data — replace with your own logic. */
function deriveUrgency(data: PatientData): UrgencyLevel {
  const highRiskSymptoms = ["sudden severe headache", "loss of consciousness", "paralysis"];
  const hasHighRisk = data.symptoms?.some((s) =>
    highRiskSymptoms.some((h) => s.toLowerCase().includes(h))
  );
  if (hasHighRisk || data.onset === "sudden") return "high";
  if (data.symptoms && data.symptoms.length >= 3) return "med";
  return "minor";
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface UrgencyRingProps {
  urgency: UrgencyState;
}

function UrgencyRing({ urgency }: UrgencyRingProps) {
  return (
    <div className={`urgency-ring ${urgency.ringClass}`}>
      <span className="urgency-level">{urgency.level}</span>
      <span className="urgency-score">{urgency.icon}</span>
      <span className="urgency-label">Urgency</span>
    </div>
  );
}

interface SymptomTagProps {
  label: string;
  high?: boolean;
}

function SymptomTag({ label, high = false }: SymptomTagProps) {
  return (
    <span className={`symptom-tag${high ? " high" : ""}`}>{label}</span>
  );
}

interface DetailCellProps {
  label: string;
  value: string;
}

function DetailCell({ label, value }: DetailCellProps) {
  return (
    <div className="detail-cell">
      <div className="detail-cell-label">{label}</div>
      <div className="detail-cell-value">{value || "—"}</div>
    </div>
  );
}

// ── Dev Testing Bar ────────────────────────────────────────────────────────

interface DevBarProps {
  onSetUrgency: (level: UrgencyLevel) => void;
}

function DevBar({ onSetUrgency }: DevBarProps) {
  return (
    <div className="dev-bar">
      <div className="dev-bar-label">Dev Testing</div>
      <button className="submit-btn test-high" onClick={() => onSetUrgency("high")}>
        Test High
      </button>
      <button className="submit-btn test-med" onClick={() => onSetUrgency("med")}>
        Test Med
      </button>
      <button className="submit-btn test-minor" onClick={() => onSetUrgency("minor")}>
        Test Minor
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Results() {
  const [patientData, setPatientData] = useState<PatientData>({});
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("high");

  useEffect(() => {
    const data = loadPatientData();
    setPatientData(data);
    setUrgencyLevel(deriveUrgency(data));
  }, []);

  const urgency = URGENCY_STATES[urgencyLevel];
  const symptoms = patientData.symptoms ?? [];

  return (
    <>
      <div className="container">
        {/* ── Hero ── */}
        <div className="results-hero">
          <div className="badge">Neurology · Results</div>
          <UrgencyRing urgency={urgency} />
          <h1 className="results-title">{urgency.title}</h1>
          <p className="results-subtitle">
            Based on the submitted symptoms and patient profile, this case has
            been flagged as {urgencyLevel} urgency.
          </p>
        </div>

        {/* ── Recommendation banner ── */}
        <div className={`recommendation-banner ${urgency.bannerClass}`}>
          <div className="rec-label" style={{ color: urgency.recLabelColor }}>
            ⚕ Clinical Recommendation
          </div>
          <div className="rec-text">{urgency.rec}</div>
        </div>

        {/* ── Patient data card ── */}
        <div className="card" style={{ animationDelay: "0.2s" }}>
          <div className="card-header">
            <div className="card-icon icon-blue">📋</div>
            <div>
              <div className="card-title">Submitted Patient Data</div>
              <div className="card-desc">
                Summary of information entered in the assessment form
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <DetailCell label="Patient Age" value={patientData.age ?? "—"} />
            <DetailCell label="Biological Sex" value={patientData.sex ?? "—"} />
            <DetailCell label="Symptom Duration" value={patientData.duration ?? "—"} />
            <DetailCell label="Onset Type" value={patientData.onset ?? "—"} />
          </div>

          {/* Symptoms */}
          <div style={{ marginTop: 20 }}>
            <div className="detail-cell-label" style={{ marginBottom: 0 }}>
              Reported Symptoms
            </div>
            <div className="symptoms-list">
              {symptoms.length > 0 ? (
                symptoms.map((s) => (
                  <SymptomTag key={s} label={s} high={urgencyLevel === "high"} />
                ))
              ) : (
                <span className="symptom-tag" style={{ color: "var(--muted)" }}>
                  None reported
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {patientData.notes && (
            <div style={{ marginTop: 20 }}>
              <div className="detail-cell">
                <div className="detail-cell-label">Clinical Notes</div>
                <div
                  className="detail-cell-value"
                  style={{ fontWeight: 300, lineHeight: 1.6 }}
                >
                  {patientData.notes}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="actions-row">
          <a href="../index.html" className="back-btn">
            ← New Assessment
          </a>
          <button className="submit-btn" onClick={() => window.print()} style={{ maxWidth: 200 }}>
            Print Report
          </button>
        </div>

        <p className="disclaimer">
          This tool is intended to assist clinical decision-making and does not
          replace the judgment of a licensed medical professional.
        </p>

        <DevBar onSetUrgency={setUrgencyLevel} />
      </div>
    </>
  );
}