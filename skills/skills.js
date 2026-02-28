import { loadHeaderFooter } from "../scripts/utils.mjs";

loadHeaderFooter();

(function () {
  const modal = document.getElementById('skill-modal');
  const titleEl = document.getElementById('skill-modal-title');
  const closeBtn = modal.querySelector('.skill-modal__close');
  const form = document.getElementById('skill-form');
  const skillIdInput = document.getElementById('skill-id');
  const durationNumber = document.getElementById('duration-number');
  const durationUnit = document.getElementById('duration-unit');
  const difficulty = document.getElementById('difficulty');
  const otherInfo = document.getElementById('other-info');
  const btnCancel = modal.querySelector('.btn-cancel');
  let lastActive = null;

  function storageKey(id) { return `skill:${id}`; }

  function openModal(skillId, skillLabel, trigger) {
    titleEl.textContent = skillLabel || skillId;
    skillIdInput.value = skillId;
    // try load saved data
    try {
      const raw = localStorage.getItem(storageKey(skillId));
      if (raw) {
        const data = JSON.parse(raw);
        durationNumber.value = data.durationNumber ?? 1;
        durationUnit.value = data.durationUnit ?? 'hours';
        difficulty.value = data.difficulty ?? 'beginner';
        otherInfo.value = data.otherInfo ?? '';
      } else {
        // defaults
        durationNumber.value = 1;
        durationUnit.value = 'hours';
        difficulty.value = 'beginner';
        otherInfo.value = '';
      }
    } catch (e) {
      durationNumber.value = 1;
      durationUnit.value = 'hours';
      difficulty.value = 'beginner';
      otherInfo.value = '';
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    lastActive = trigger || null;
    // focus first form control
    durationNumber.focus();
    document.addEventListener('keydown', onKey);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    if (lastActive && lastActive.focus) lastActive.focus();
    lastActive = null;
  }

  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  // delegation: open modal when clicking a skill button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.skill-btn');
    if (btn) {
      const id = btn.dataset.skill || btn.innerText.trim();
      const label = btn.innerText.trim();
      openModal(id, label, btn);
      return;
    }

    // close on backdrop or close button or cancel
    if (e.target.matches('.skill-modal__backdrop') || e.target.matches('.skill-modal__close') || e.target.matches('.btn-cancel')) {
      closeModal();
    }
  });

  // clicking directly on modal container (safety)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // handle save
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = skillIdInput.value || (Math.random() + '');
    const payload = {
      durationNumber: Number(durationNumber.value),
      durationUnit: durationUnit.value,
      difficulty: difficulty.value,
      otherInfo: otherInfo.value.trim(),
      savedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(storageKey(id), JSON.stringify(payload));
    } catch (err) {
      console.error('Could not save skill data', err);
    }
    closeModal();
  });

  // cancel button also closes
  btnCancel.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });

  // delegate "Start Learning" redirect to outline page
  document.addEventListener('click', (e) => {
    const lb = e.target.closest('.btn-save');
    if (!lb) return;
    e.preventDefault();
    window.location.href = '../outline/outline.html';
  });
})();