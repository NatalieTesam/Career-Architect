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
  const url = `/api/jobs?role=${encodeURIComponent(role)}&results_per_page=5`;

  try {
    const response = await fetch(url);
    const jobs = await response.json();
    displayJobs(jobs);

    // return jobs.results;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
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
  "Apply to Targeted Roles",
  "Test"
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
  const container = document.getElementById("steps-tree");
  const svg = document.getElementById("connections");

  const width = container.clientWidth;
  const height = container.clientHeight;

  const nodePositions = [];

  steps.forEach((step, index) => {
    const node = document.createElement("div");
    node.classList.add("node");
    node.innerHTML = step;

    // Random position (with padding so it doesn't overflow)
    const x = Math.random() * (width - 150);
    const y = Math.random() * (height - 150);

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    container.appendChild(node);

    nodePositions.push({
      x: x + 60, // center of circle
      y: y + 60
    });
  });

  // Draw lines between nodes (sequential connection)
  nodePositions.forEach((pos, index) => {
    if (index === 0) return;

    const prev = nodePositions[index - 1];

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", prev.x);
    line.setAttribute("y1", prev.y);
    line.setAttribute("x2", pos.x);
    line.setAttribute("y2", pos.y);
    line.setAttribute("stroke", "#4CAF50");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);
  });
}






async function init(){
  // generalSkills();
  branchTemplate(users);

  getJobs("developer");
  // renderStepsTree(professionalSteps);
  createGraph(professionalSteps);

};

window.onload = init;
