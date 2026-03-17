const SYMPTOMS_DATA = [
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

const countPill = document.getElementById('countPill');

function updateCount() {
  const n = document.querySelectorAll('input[name="symptoms"]:checked').length;
  countPill.textContent = n;

  if (n === 0) {
    countPill.style.background = 'rgba(229,114,0,0.15)';
    countPill.style.color = 'var(--accent)';
  } else if (n <= 3) {
    countPill.style.background = 'rgba(255,167,38,0.18)';
    countPill.style.color = 'var(--warn)';
  } else {
    countPill.style.background = 'rgba(239,83,80,0.18)';
    countPill.style.color = 'var(--accent2)';
  }
}

function renderSymptoms(filter) {
  const checked = new Set(
    [...document.querySelectorAll('input[name="symptoms"]:checked')].map(c => c.value)
  );
  const q = (filter || '').trim().toLowerCase();
  const filtered = q
    ? SYMPTOMS_DATA.filter(s =>
        s.name.toLowerCase().includes(q) || s.detail.toLowerCase().includes(q))
    : SYMPTOMS_DATA;

  document.getElementById('symptomGrid').innerHTML = filtered.map(s => `
    <div class="symptom-item">
      <input type="checkbox" id="${s.id}" name="symptoms" value="${s.id}"${checked.has(s.id) ? ' checked' : ''}>
      <label for="${s.id}">
        <div class="check-box"></div>
        <div class="symptom-label-content">
          <span class="symptom-name">${s.name}</span>
          <span class="symptom-detail">${s.detail}</span>
          <span class="sev sev-${s.severity}">${s.severityLabel}</span>
        </div>
      </label>
    </div>`).join('');

  updateCount();
}

renderSymptoms();

document.getElementById('symptomGrid').addEventListener('change', (e) => {
  if (e.target.name === 'symptoms') updateCount();
});

document.getElementById('symptomSearch').addEventListener('input', (e) => {
  renderSymptoms(e.target.value);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('assessmentForm').reset();
  renderSymptoms('');
  document.getElementById('resultBanner').style.display = 'none';
});

document.getElementById('assessmentForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const age      = document.getElementById('age').value.trim();
  const duration = document.getElementById('symptom_duration').value.trim();
  const unit     = document.getElementById('duration_unit').value;
  const onset    = document.getElementById('onset').value;
  const notes    = document.getElementById('notes').value.trim();
  const selected = [...document.querySelectorAll('input[name="symptoms"]:checked')].map(c => c.value);

  const banner = document.getElementById('resultBanner');
  const label  = document.getElementById('resultLabel');
  const text   = document.getElementById('resultText');

  if (!age || !duration) {
    banner.className     = 'result-banner warn';
    label.textContent    = '⚠  Incomplete Submission';
    text.textContent     = "Please enter the patient's age and symptom duration before submitting the assessment.";
    banner.style.display = 'block';
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // Build query string and redirect to results page
  const params = new URLSearchParams();
  params.set('age', age);
  params.set('symptom_duration', duration);
  params.set('duration_unit', unit);
  if (onset) params.set('onset', onset);
  if (document.getElementById('sex').value) params.set('sex', document.getElementById('sex').value);
  if (notes) params.set('notes', notes);
  selected.forEach(s => params.append('symptoms', s));

  window.location.href = '/result/?' + params.toString();
});

// Symptom Duration: digits-only typing, max 2 digits
document.getElementById('symptom_duration').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
});

document.getElementById('symptom_duration').addEventListener('blur', (e) => {
  const n = parseInt(e.target.value);
  if (!isNaN(n)) e.target.value = n;
});

// Symptom Duration stepper buttons
document.getElementById('durationPlus').addEventListener('click', () => {
  const input = document.getElementById('symptom_duration');
  const next = (parseInt(input.value) || 0) + 1;
  if (next <= 99) input.value = next;
});

document.getElementById('durationMinus').addEventListener('click', () => {
  const input = document.getElementById('symptom_duration');
  const val = parseInt(input.value) || 0;
  if (val > 0) input.value = val - 1;
});
