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

async function init(){
  // generalSkills();
  branchTemplate(users);

  getJobs("developer");

};

window.onload = init;
