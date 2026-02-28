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

function generalSkills() {

}

function branchTemplate(users) {
  const html = users
    .map(user => `<div><h4>${user.name}</h4><p>Skills: ${user.skills.join(", ")}</p></div>`)
    .join("");

  const container = document.getElementById("template");
  // container.innerHTML = html;
}

async function getJobs(role = "developer") {
  const url = `/api/jobs?role=${encodeURIComponent(role)}&results_per_page=8`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error");

    const jobs = await response.json();
    displayJobs(jobs);

    // return jobs.results;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    document.getElementById('jobs').innerHTML = '<p>Could not load jobs at this time.</p>';
  }
};

document.getElementById("search-button").addEventListener("click", () => {
  const roleInput = document.getElementById("role-input").value.trim();
  if (roleInput) {
    getJobs(roleInput);
  }
});


function displayJobs(jobs) {
  const container = document.getElementById("jobs");
  if (!jobs || jobs.length === 0) {
    container.innerHTML = "<p>No jobs found.</p>";
    return;
  }

  container.innerHTML = jobs.map(job => `
    <div class="job">
      <h3>${job.title}</h3>
      <p>${job.company.display_name}</p>
      <a href="${job.redirect_url}" target="_blank" class="job-link">View Job</a>
    </div>
  `).join("");
};

function getMasterProgress() {
  const raw = localStorage.getItem("career_progress_file");

  if (!raw) {
    console.log("No master file found");
    return null;
  }

  return JSON.parse(raw);
};

// document.addEventListener("DOMContentLoaded", () => {
//   const data = getMasterProgress();
//   console.log("Loaded data:", data);
// });

function extractSkills(masterFile) {
  if (!masterFile || !masterFile.allSkills) return [];

  return Object.values(masterFile.allSkills).map(skill => ({
    title: skill.skillTitle,
    phases: skill.completedPhases.map(p => p.phaseTitle)
  }));
};

document.addEventListener("DOMContentLoaded", () => {
  const master = getMasterProgress();
  const skills = extractSkills(master);

  console.log("Extracted skills:", skills);
});

function renderSkills(skills) {
  const container = document.getElementById("skills-container");
  container.innerHTML = "";

  skills.forEach(skill => {
    const skillTitle = document.createElement("h2");
    skillTitle.innerText = skill.title;
    container.appendChild(skillTitle);

    const roadmap = document.createElement("div");
    roadmap.style.display = "flex";
    roadmap.style.gap = "20px";
    roadmap.style.marginBottom = "40px";

    skill.phases.forEach((phase, index) => {

      const box = document.createElement("div");
      box.innerText = `${phase}`;
      box.style.padding = "15px";
      box.style.background = "#fff";
      box.style.borderRadius = "8px";
      box.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";

      roadmap.appendChild(box);

      if (index < skill.phases.length - 1) {
        const arrow = document.createElement("div");
        arrow.innerText = ">";
        arrow.style.fontSize = "24px";
        arrow.style.alignSelf = "center";
        roadmap.appendChild(arrow);
      }
    });

    container.appendChild(roadmap);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const master = getMasterProgress();
  const skills = extractSkills(master);
  renderSkills(skills);
});



// let skills = [
//   {
//     title: "Informational Interviews",
//     phases: [
//       "Research professionals in your field",
//       "Send 5 outreach messages",
//       "Schedule 2 calls",
//       "Follow up and thank them"
//     ]
//   },
//   {
//     title: "LinkedIn Optimization",
//     phases: [
//       "Update headline",
//       "Rewrite summary",
//       "Add 5 new connections",
//       "Request 2 recommendations"
//     ]
//   }
// ];

// function loadSkillsFromMasterFile() {
//   const raw = localStorage.getItem("career_progress_file");

//   if (!raw) return [];

//   const masterFile = JSON.parse(raw);

//   const skills = Object.values(masterFile.allSkills).map(skill => ({
//     title: skill.skillTitle,
//     phases: skill.completedPhases.map(phase => phase.phaseTitle)
//   }));

//   return skills;
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const skills = loadSkillsFromMasterFile();
//   renderSkills(skills);
// });

// function renderRoadmap(phases) {
//   const roadmap = document.getElementById("roadmap");
//   roadmap.innerHTML = "";

//   phases.forEach((phase, index) => {

//     const phaseDiv = document.createElement("div");
//     phaseDiv.classList.add("phase");
//     phaseDiv.innerText = `Phase ${index + 1}: ${phase}`;

//     roadmap.appendChild(phaseDiv);

//     if (index < phases.length - 1) {
//       const arrow = document.createElement("div");
//       arrow.classList.add("arrow");
//       arrow.textContent = ">";
//       roadmap.appendChild(arrow);
//     }
//   });
// };

// function addPhase(text) {
//   phases.push(text);
//   renderRoadmap(phases);
// };

// function renderStepsTree(steps) {
//   const container = document.getElementById("steps-tree");

//   container.innerHTML = steps
//     .map((step, index) => `
//       <div class="tree-node">
//         <div class="circle"><p>${step}</p> </div>
//       </div>
//       ${index < steps.length - 1 ? '<div class="tree-line"></div>' : ''}
//     `)
//     .join("");
// }

// function createGraph(steps) {
//   const tree = document.getElementById("steps-tree");
//   const svg = document.getElementById("connections");

//   // Clear previous nodes & lines
//   tree.querySelectorAll(".node").forEach(n => n.remove());
//   svg.innerHTML = "";

//   const width = 900;
//   const height = 440;
//   const nodeSize = 120;

//   const nodePositions = [];

//   function isTooClose(x, y, positions, minDistance) {
//     return positions.some(pos => {
//       const dx = pos.x - x;
//       const dy = pos.y - y;
//       return Math.sqrt(dx * dx + dy * dy) < minDistance;
//     });
//   }

//   steps.forEach(step => {
//     const node = document.createElement("div"); // NEW element each time
//     node.classList.add("node");
//     node.innerHTML = step;

//     let x, y;
//     let attempts = 0;
//     const maxAttempts = 100;

//     do {
//       x = Math.random() * (width - nodeSize);
//       y = Math.random() * (height - nodeSize);
//       attempts++;
//     } while (
//       isTooClose(x + nodeSize / 2, y + nodeSize / 2, nodePositions, 160) &&
//       attempts < maxAttempts
//     );

//     node.style.left = `${x}px`;
//     node.style.top = `${y}px`;

//     tree.appendChild(node);

//     nodePositions.push({
//       x: x + nodeSize / 2,
//       y: y + nodeSize / 2
//     });
//   });

//   // Draw connecting lines
//   // nodePositions.forEach((pos, index) => {
//   //   if (index === 0) return;

//   //   const prev = nodePositions[index - 1];

//   //   const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

//   //   line.setAttribute("x1", prev.x);
//   //   line.setAttribute("y1", prev.y);
//   //   line.setAttribute("x2", pos.x);
//   //   line.setAttribute("y2", pos.y);
//   //   line.setAttribute("stroke", "#4CAF50");
//   //   line.setAttribute("stroke-width", "2");

//   //   svg.appendChild(line);
//   // });
// };










async function init() {
  // generalSkills();
  branchTemplate(users);

  getJobs("developer");
  // renderStepsTree(professionalSteps);
  // createGraph(professionalSteps);
  // renderRoadmap(phases);

};

window.onload = init;
