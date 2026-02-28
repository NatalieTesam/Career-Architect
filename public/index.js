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

async function getJobs(role) {
  const url = `/api/jobs?role=${encodeURIComponent(role)}&results_per_page=8`;

  try {
    const response = await fetch(url);
    const jobs = await response.json();
    displayJobs(jobs);

    // return jobs.results;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    document.getElementById('jobs').innerHTML = '<p>Could not load jobs at this time.</p>';
    return [];
  }

  document.getElementById("search-button").addEventListener("click", () => {
    const roleInput = document.getElementById("role-input").value.trim();
    if (roleInput) {
      getJobs(roleInput);
    }
  });

};

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
}


const professionalSteps = [
  "Optimize LinkedIn Profile",
  "Grow LinkedIn Connections",
  "Attend Web Dev Meetups",
  "Conduct Informational Interview",
  "Apply to Targeted Roles ~ hardwork, cooperation"
];

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

function createGraph(steps) {
  const tree = document.getElementById("steps-tree");
  const svg = document.getElementById("connections");

  // Clear previous nodes & lines
  tree.querySelectorAll(".node").forEach(n => n.remove());
  svg.innerHTML = "";

  const width = 900;
  const height = 460;
  const nodeSize = 120;

  const nodePositions = [];

  function isTooClose(x, y, positions, minDistance) {
    return positions.some(pos => {
      const dx = pos.x - x;
      const dy = pos.y - y;
      return Math.sqrt(dx * dx + dy * dy) < minDistance;
    });
  }

  steps.forEach(step => {
    const node = document.createElement("div"); // ✅ NEW element each time
    node.classList.add("node");
    node.innerHTML = step;

    let x, y;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      x = Math.random() * (width - nodeSize);
      y = Math.random() * (height - nodeSize);
      attempts++;
    } while (
      isTooClose(x + nodeSize / 2, y + nodeSize / 2, nodePositions, 160) &&
      attempts < maxAttempts
    );

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    tree.appendChild(node);

    nodePositions.push({
      x: x + nodeSize / 2,
      y: y + nodeSize / 2
    });
  });

  // Draw connecting lines
  // nodePositions.forEach((pos, index) => {
  //   if (index === 0) return;

  //   const prev = nodePositions[index - 1];

  //   const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  //   line.setAttribute("x1", prev.x);
  //   line.setAttribute("y1", prev.y);
  //   line.setAttribute("x2", pos.x);
  //   line.setAttribute("y2", pos.y);
  //   line.setAttribute("stroke", "#4CAF50");
  //   line.setAttribute("stroke-width", "2");

  //   svg.appendChild(line);
  // }.);
};










async function init() {
  // generalSkills();
  branchTemplate(users);

  getJobs("developer");
  // renderStepsTree(professionalSteps);
  createGraph(professionalSteps);

};

window.onload = init;
