import { loadHeaderFooter } from "../scripts/utils.mjs";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login/login.html";
}

loadHeaderFooter();

// 1. Define openModal in the global scope so renderJobCard can see it
let openModal; 

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

    // Assign the function to the outer variable
    openModal = function(skillId, skillLabel, trigger) {
        titleEl.textContent = skillLabel || skillId;
        skillIdInput.value = skillId;

        // Try load saved data from localStorage
        try {
            const raw = localStorage.getItem(storageKey(skillId));
            if (raw) {
                const data = JSON.parse(raw);
                durationNumber.value = data.durationNumber ?? 1;
                durationUnit.value = data.durationUnit ?? 'hours';
                difficulty.value = data.difficulty ?? 'beginner';
                otherInfo.value = data.notes ?? '';
            } else {
                durationNumber.value = 1;
                durationUnit.value = 'hours';
                difficulty.value = 'beginner';
                otherInfo.value = '';
            }
        } catch (e) {
            console.error("Local storage error", e);
        }

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        lastActive = trigger || null;
        durationNumber.focus();
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      const skillTitle = document.getElementById("skill-modal-title").innerText;
  
      const payload = {
        skill: titleEl.textContent,
        durationNumber: durationNumber.value,
        durationUnit: durationUnit.value,
        duration: `${durationNumber.value} ${durationUnit.value}`, 
        difficulty: difficulty.value,
        notes: otherInfo.value.trim(),
        savedAt: new Date().toISOString()
    };
  
     // SAVE DATA TO SESSION
      sessionStorage.setItem('learningPlan', JSON.stringify(payload));
    
      const durationNumber = document.getElementById("duration-number").value;
      const durationUnit = document.getElementById("duration-unit").value;
      const difficulty = document.getElementById("difficulty").value;
      const notes = document.getElementById("other-info").value;
    
  
        // Save to localStorage for persistence
        try {
            const id = skillIdInput.value || Date.now();
            localStorage.setItem(storageKey(id), JSON.stringify(payload));
        } catch (err) {
            console.error('Could not save to localStorage', err);
        }
  
  
      try {
        const res = await fetch("/api/skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            skill_name: skillTitle
          })
        });
    
        const data = await res.json();
        console.log("Saved skill:", data);
    
        alert("Skill added to your profile!");
      } catch (err) {
        console.error(err);
      }
  
      closeModal();
      // REDIRECT AFTER SAVING
      window.location.href = '../outline/outline.html';
    });

    // Delegation for skill buttons
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

        document.getElementById(`loading-${loadingId}`).remove();
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