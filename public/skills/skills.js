import { loadHeaderFooter } from "../scripts/utils.mjs";

// Keep this commented out if you aren't logged in during testing
const token = localStorage.getItem("token");
/*
if (!token) {
  window.location.href = "../login/login.html";
}
*/

loadHeaderFooter();

let openModal; 

(function () {
    const modal = document.getElementById('skill-modal');
    const titleEl = document.getElementById('skill-modal-title');
    const form = document.getElementById('skill-form');
    const skillIdInput = document.getElementById('skill-id');
    
    // These are the ELEMENTS
    const durationNumEl = document.getElementById('duration-number');
    const durationUnitEl = document.getElementById('duration-unit');
    const difficultyEl = document.getElementById('difficulty');
    const otherInfoEl = document.getElementById('other-info');
    
    const btnCancel = modal.querySelector('.btn-cancel');
    let lastActive = null;

    function storageKey(id) { return `skill:${id}`; }

    openModal = function(skillId, skillLabel, trigger) {
        titleEl.textContent = skillLabel || skillId;
        skillIdInput.value = skillId;

        try {
            const raw = localStorage.getItem(storageKey(skillId));
            if (raw) {
                const data = JSON.parse(raw);
                durationNumEl.value = data.durationNumber ?? 1;
                durationUnitEl.value = data.durationUnit ?? 'hours';
                difficultyEl.value = data.difficulty ?? 'beginner';
                otherInfoEl.value = data.notes ?? '';
            } else {
                durationNumEl.value = 1;
                durationUnitEl.value = 'hours';
                difficultyEl.value = 'beginner';
                otherInfoEl.value = '';
            }
        } catch (e) {
            console.error("Local storage error", e);
        }

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        lastActive = trigger || null;
        durationNumEl.focus();
        document.addEventListener('keydown', onKey);
    };

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

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Form submitted!");

      try {
          // 1. Capture the data
          const payload = {
            skill: titleEl.textContent,
            durationNumber: durationNumEl.value,
            durationUnit: durationUnitEl.value,
            duration: `${durationNumEl.value} ${durationUnitEl.value}`, 
            difficulty: difficultyEl.value,
            notes: otherInfoEl.value.trim(),
            savedAt: new Date().toISOString()
          };
      
          // 2. Save to Session
          sessionStorage.setItem('learningPlan', JSON.stringify(payload));
          console.log("Session saved:", payload);
        
          // 3. Save to LocalStorage
          const id = skillIdInput.value || Date.now();
          localStorage.setItem(storageKey(id), JSON.stringify(payload));
      
          closeModal();
          
          // 4. THE REDIRECT (with fallback check)
          console.log("Attempting redirect...");
          
          // Try relative path first
          window.location.href = '../outline/outline.html';

          // Fallback: If it doesn't move in 500ms, try absolute-style path
          setTimeout(() => {
              window.location.href = '/outline/outline.html';
          }, 500);

      } catch (err) {
          console.error("Critical Submit Error:", err);
          alert("Save failed: " + err.message);
      }
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.skill-btn');
        if (btn) {
            const id = btn.dataset.skill || btn.innerText.trim();
            const label = btn.innerText.trim();
            openModal(id, label, btn);
            return;
        }

        if (e.target.matches('.skill-modal__backdrop') || e.target.matches('.skill-modal__close') || e.target.matches('.btn-cancel')) {
            closeModal();
        }
    });

    btnCancel.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });
})();

// --- AI SEARCH LOGIC ---
const FEDORA_IP = "100.94.140.36"; 
const API_URL = `http://${FEDORA_IP}:1234/v1/chat/completions`;

const searchForm = document.getElementById('job-search-form');
const searchInput = document.getElementById('search-input');
const jobListContainer = document.getElementById('job-list-container');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    jobListContainer.innerHTML = ''; 
    const staticList = document.querySelector('.job-list:not(#job-list-container)');
    if (staticList) staticList.style.display = 'none';

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
                        content: `You are a career expert. For the given job title, provide a 1-sentence description followed by a pipe symbol (|) and then 5 technical skills separated by commas.` 
                    },
                    { role: "user", content: query }
                ],
                temperature: 0
            })
        });

        const data = await response.json();
        const rawText = data.choices[0].message.content;
        const [description, skillsPart] = rawText.split('|');
        const skills = skillsPart.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 5);

        const loadEl = document.getElementById(`loading-${loadingId}`);
        if (loadEl) loadEl.remove();
        renderJobCard(query, description.trim(), skills);

    } catch (err) {
        console.error(err);
        const loadEl = document.getElementById(`loading-${loadingId}`);
        if (loadEl) loadEl.innerHTML = "<h2>Error</h2><p>Fedora connection timed out.</p>";
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

    jobLi.querySelectorAll('.skill-btn').forEach(btn => {
      btn.onclick = (e) => {
          e.preventDefault();
          const skillLabel = btn.innerText.trim();
          sessionStorage.setItem('selectedSkill', skillLabel);
          sessionStorage.setItem('selectedJob', title);
          
          if (typeof openModal === "function") {
              openModal(skillLabel, skillLabel, btn);
          } else {
              btn.dispatchEvent(new Event('click', { bubbles: true }));
          }
      };
  });
}