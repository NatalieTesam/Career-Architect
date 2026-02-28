import { loadHeaderFooter } from "../scripts/utils.mjs";

loadHeaderFooter();
// Define this outside so other functions can see it
let openModal; 

(function () {
  const modal = document.getElementById('skill-modal');
  // ... (keep all your other consts the same)

  // Assign the function to the outer variable
  openModal = function(skillId, skillLabel, trigger) {
     // ... (keep all your existing openModal logic)
  };

  // ... (keep the rest of the IIFE as is)
})();

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

const FEDORA_IP = "10.3.9.69"; 
const API_URL = `http://${FEDORA_IP}:1234/v1/chat/completions`;

const searchForm = document.getElementById('job-search-form');
const searchInput = document.getElementById('search-input');
const jobListContainer = document.getElementById('job-list-container');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    // Clear previous results
    jobListContainer.innerHTML = ''; 

    document.querySelector('.job-list:not(#job-list-container)').style.display = 'none';

    const loadingId = Date.now();
    jobListContainer.insertAdjacentHTML('afterbegin', `
        <li class="job" id="loading-${loadingId}">
            <h2>Analyzing ${query}...</h2>
            <p>Fetching role description and 2026 skill requirements...</p>
        </li>
    `);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "google/gemma-3-1b-it",
                messages: [
                    { 
                        role: "system", 
                        content: `You are a career expert. For the given job title, provide a 1-sentence description followed by a pipe symbol (|) and then 5 technical skills separated by commas. 
                        Example format: A professional who protects networks from cyber threats. | Network Security, Firewalls, Python, Risk Assessment, Encryption` 
                    },
                    { role: "user", content: query }
                ],
                temperature: 0,
                max_tokens: 150
            })
        });

        const data = await response.json();
        const rawText = data.choices[0].message.content;

        // Split the description from the skills using the pipe (|)
        const [description, skillsPart] = rawText.split('|');
        
        const skills = skillsPart
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .slice(0, 5);

        document.getElementById(`loading-${loadingId}`).remove();

        // Pass the new description to the render function
        renderJobCard(query, description.trim(), skills);

    } catch (err) {
        console.error(err);
        document.getElementById(`loading-${loadingId}`).innerHTML = "<h2>Error</h2><p>Fedora connection timed out.</p>";
    }
});

function renderJobCard(title, description, skills) {
    const jobLi = document.createElement('li');
    jobLi.className = 'job';
    
    jobLi.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p> 
        <div class="skills-container">
            <h3>Skills Required:</h3>
            <ul class="skills-list">
                ${skills.map(skill => `
                    <li>
                        <button type="button" class="skill-btn" data-skill="${skill}">
                            ${skill}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    jobListContainer.prepend(jobLi);

    // --- THE FIX: Make AI buttons open the modal ---
    jobLi.querySelectorAll('.skill-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const skillLabel = btn.innerText.trim();
            // This calls the openModal function from your top section
            // We use sessionStorage so the next page knows what we're learning
            sessionStorage.setItem('selectedSkill', skillLabel);
            sessionStorage.setItem('selectedJob', title);
            
            // Trigger the modal (global access check)
            if (typeof openModal === "function") {
                openModal(skillLabel, skillLabel, btn);
            } else {
                // If openModal is trapped in the IIFE, we trigger a click 
                // on the document listener you already have.
                btn.dispatchEvent(new Event('click', { bubbles: true }));
            }
        };
    });
}