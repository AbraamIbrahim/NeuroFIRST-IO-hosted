const checkboxes = document.querySelectorAll('input[name="symptoms"]');
const countPill  = document.getElementById('countPill');

function updateCount() {
  const n = [...checkboxes].filter(c => c.checked).length;
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

checkboxes.forEach(cb => cb.addEventListener('change', updateCount));

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('assessmentForm').reset();
  updateCount();
  document.getElementById('resultBanner').style.display = 'none';
});

document.getElementById('assessmentForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const age      = document.getElementById('age').value.trim();
  const duration = document.getElementById('symptom_duration').value.trim();
  const unit     = document.getElementById('duration_unit').value;
  const onset    = document.getElementById('onset').value;
  const notes    = document.getElementById('notes').value.trim();
  const selected = [...checkboxes].filter(c => c.checked).map(c => c.value);

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
