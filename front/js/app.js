const checkboxes = document.querySelectorAll('input[name="symptoms"]');
const countPill  = document.getElementById('countPill');

function updateCount() {
  const n = [...checkboxes].filter(c => c.checked).length;
  countPill.textContent = n;

  if (n === 0) {
    countPill.style.background = 'rgba(79,195,247,0.15)';
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

  const symptomList = selected.length
    ? selected.map(s => s.replace(/_/g, ' ')).join(', ')
    : 'none reported';

  banner.className  = 'result-banner info';
  label.textContent = '✓ Assessment Captured';
  text.innerHTML    =
    `<strong>Age:</strong> ${age} yrs &nbsp;·&nbsp; ` +
    `<strong>Duration:</strong> ${duration} ${unit}` +
    (onset ? ` &nbsp;·&nbsp; <strong>Onset:</strong> ${onset}` : '') +
    `<br><strong>Symptoms (${selected.length}):</strong> ${symptomList}` +
    (notes ? `<br><strong>Notes:</strong> ${notes}` : '') +
    `<br><br>Form data is ready to be passed to the urgency scoring algorithm.`;

  banner.style.display = 'block';
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
