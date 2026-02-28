const FEDORA_IP = "100.94.140.36"; 
const API_URL = `http://${FEDORA_IP}:1234/v1/chat/completions`;

const users = [
  {
    id: 1,
    name: "John",
    skills: ["React", "Node.js", "TypeScript"]
  },
  {
    id: 2,
    name: "Sarah",
    skills: ["Python", "Django"]
  }
];

// --- DATA UTILITIES ---

function getMasterProgress() {
  const raw = localStorage.getItem("career_progress_file");
  if (!raw) {
    console.log("No master file found");
    return null;
  }
  return JSON.parse(raw);
}

function extractSkills(masterFile) {
  if (!masterFile || !masterFile.allSkills) return [];

  return Object.values(masterFile.allSkills).map(skill => ({
    title: skill.skillTitle,
    phases: skill.completedPhases.map(p => p.phaseTitle)
  }));
}

// --- UI RENDERING ---

function branchTemplate(users) {
  const html = users
    .map(user => `<div><h4>${user.name}</h4><p>Skills: ${user.skills.join(", ")}</p></div>`)
    .join("");

  const container = document.getElementById("template");
  if (container) container.innerHTML = html;
}

function renderSkills(skills) {
  const container = document.getElementById("skills-container");
  if (!container) return;
  container.innerHTML = "";

  if (skills.length === 0) {
    container.innerHTML = "<p style='color: #6b7280;'>No skills started yet. Visit the Skills page to begin!</p>";
    return;
  }

  skills.forEach(skill => {
    const skillTitle = document.createElement("h2");
    skillTitle.style.margin = "20px 0 10px 0";
    skillTitle.innerText = skill.title;
    container.appendChild(skillTitle);

    const roadmap = document.createElement("div");
    roadmap.style.display = "flex";
    roadmap.style.gap = "20px";
    roadmap.style.marginBottom = "40px";
    roadmap.style.flexWrap = "wrap";

    skill.phases.forEach((phase, index) => {
      const box = document.createElement("div");
      box.innerText = `${phase}`;
      box.style.padding = "15px";
      box.style.background = "#fff";
      box.style.borderRadius = "8px";
      box.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
      box.style.border = "1px solid #e5efe9";

      roadmap.appendChild(box);

      if (index < skill.phases.length - 1) {
        const arrow = document.createElement("div");
        arrow.innerText = ">";
        arrow.style.fontSize = "24px";
        arrow.style.alignSelf = "center";
        arrow.style.color = "#22c55e";
        roadmap.appendChild(arrow);
      }
    });

    container.appendChild(roadmap);
  });
}

// --- JOB API LOGIC ---

async function getJobs(role = "developer") {
  const url = `/api/jobs?role=${encodeURIComponent(role)}&results_per_page=8`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error");

    const jobs = await response.json();
    displayJobs(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    document.getElementById('jobs').innerHTML = '<p>Could not load jobs at this time.</p>';
  }
}

function displayJobs(jobs) {
  const container = document.getElementById("jobs");
  if (!jobs || jobs.length === 0) {
    container.innerHTML = "<p>No jobs found.</p>";
    return;
  }

  container.innerHTML = jobs.map(job => `
    <div class="job" style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 8px;">
      <h3 style="font-size: 1rem;">${job.title}</h3>
      <p style="font-size: 0.8rem; color: #6b7280;">${job.company.display_name}</p>
      <a href="${job.redirect_url}" target="_blank" class="job-link" style="color: #22c55e; font-size: 0.8rem;">View Job</a>
    </div>
  `).join("");
}

// --- AI RESUME BUILDER LOGIC ---

async function generateResumeBullets() {
  const bulletContainer = document.getElementById('bullet-point');
  const masterData = getMasterProgress();

  if (!masterData || !masterData.allSkills) {
    bulletContainer.innerHTML = "<p style='font-size: 0.8rem; color: #6b7280;'>Finish a roadmap phase to see AI bullets!</p>";
    return;
  }

  const completedSkills = Object.values(masterData.allSkills).filter(s => s.completedPhases.length > 0);

  if (completedSkills.length === 0) {
    bulletContainer.innerHTML = "<p style='font-size: 0.8rem; color: #6b7280;'>Check off some tasks in 'Next Steps' to build your resume.</p>";
    return;
  }

  bulletContainer.innerHTML = "<em style='font-size: 0.8rem;'>Writing resume lines...</em>";

  for (const skillEntry of completedSkills) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemma-3-1b-it",
          messages: [
            { 
              role: "system", 
              content: "You are a Technical Resume Expert. Write ONE powerful, measurable resume bullet point starting with a strong action verb based on these tasks. One sentence only. Do not use Markdown bolding." 
            },
            { 
              role: "user", 
              content: `Skill: ${skillEntry.skillTitle}. Completed Work: ${JSON.stringify(skillEntry.completedPhases)}` 
            }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      const aiBullet = data.choices[0].message.content;

      if (bulletContainer.querySelector('em')) bulletContainer.innerHTML = "";

      const bulletWrapper = document.createElement('div');
      bulletWrapper.style = "margin-bottom: 12px; padding: 8px; border-left: 3px solid #22c55e; background: #fff; border-radius: 4px;";
      bulletWrapper.innerHTML = `
        <strong style="font-size: 0.7rem; color: #16a34a; text-transform: uppercase;">${skillEntry.skillTitle}</strong>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #374151;">• ${aiBullet}</p>
      `;
      bulletContainer.appendChild(bulletWrapper);

    } catch (err) {
      console.error("AI Error:", err);
      bulletContainer.innerHTML = "<p style='font-size: 0.8rem; color: #ef4444;'>AI Server Offline</p>";
    }
  }
}

// --- INITIALIZATION ---

async function init() {
  // 1. Run Legacy Functions
  branchTemplate(users);
  getJobs("developer");

  // 2. Load and Render Visual Roadmap
  const master = getMasterProgress();
  const skills = extractSkills(master);
  renderSkills(skills);

  // 3. Generate AI Resume Content
  generateResumeBullets();
}

// Listeners
document.getElementById("search-button").addEventListener("click", () => {
  const roleInput = document.getElementById("role-input").value.trim();
  if (roleInput) {
    getJobs(roleInput);
  }
});

window.onload = init;