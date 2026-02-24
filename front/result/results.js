// High-priority symptom values (matches the checkbox values in index.html)
const HIGH_PRIORITY = new Set([
  'headache_severe', 'focal_weakness', 'speech_difficulty',
  'vision_loss', 'altered_consciousness', 'seizure', 'neck_stiffness'
]);

function formatLabel(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function populate() {
  const params = new URLSearchParams(window.location.search);

  const age      = params.get('age');
  const sex      = params.get('sex');
  const duration = params.get('symptom_duration');
  const unit     = params.get('duration_unit');
  const onset    = params.get('onset');
  const notes    = params.get('notes');
  const symptoms = params.getAll('symptoms');

  if (age)      document.getElementById('res-age').textContent      = age + ' yrs';
  if (sex)      document.getElementById('res-sex').textContent      = formatLabel(sex);
  if (duration) document.getElementById('res-duration').textContent = `${duration} ${unit || ''}`.trim();
  if (onset)    document.getElementById('res-onset').textContent    = formatLabel(onset);

  if (notes) {
    const cell = document.getElementById('notes-cell');
    cell.style.display = 'block';
    document.getElementById('res-notes').textContent = notes;
  }

  const symptomList = document.getElementById('res-symptoms');
  if (symptoms.length > 0) {
    symptomList.innerHTML = '';
    symptoms.forEach(s => {
      const tag = document.createElement('span');
      tag.className = 'symptom-tag' + (HIGH_PRIORITY.has(s) ? ' high' : '');
      tag.textContent = formatLabel(s);
      symptomList.appendChild(tag);
    });
  }
}

populate();