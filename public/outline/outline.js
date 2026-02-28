import { loadHeaderFooter } from "../scripts/utils.mjs";

loadHeaderFooter();

(function () {
  const section = document.querySelector('.skill-checklist');
  if (!section) return;
  const checkboxes = Array.from(section.querySelectorAll('input[type="checkbox"]'));
  const progress = document.getElementById('skill-progress');
  const text = document.getElementById('progress-text');

  function update() {
    const total = checkboxes.length;
    const checked = checkboxes.filter(cb => cb.checked).length;
    progress.max = total || 0;
    progress.value = checked || 0;
    text.textContent = `${checked} / ${total}`;
  }

  checkboxes.forEach(cb => cb.addEventListener('change', update));
  // init
  update();
})();

(() => {
  const section = document.querySelector('.skill-checklist');
  if (!section) return;
  const checkboxes = Array.from(section.querySelectorAll('input[type="checkbox"]'));
  const progress = document.getElementById('skill-progress');
  const text = document.getElementById('progress-text');
  const percent = document.getElementById('progress-percent');

  function updateProgress() {
    const total = checkboxes.length;
    const checked = checkboxes.filter(cb => cb.checked).length;
    progress.max = total || 0;
    progress.value = checked || 0;
    text.textContent = `${checked} / ${total}`;
    const pct = total ? Math.ceil((checked / total) * 100) : 0;
    percent.textContent = `${pct}%`;
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));
  updateProgress();
})();