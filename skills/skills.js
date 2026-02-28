import { loadHeaderFooter } from "../scripts/utils.mjs";

loadHeaderFooter();

const FEDORA_IP = "100.94.140.36"; 
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
                        <button type="button" class="skill-btn">
                            ${skill}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    jobListContainer.prepend(jobLi);

    // Setup click events for the outline page
    jobLi.querySelectorAll('.skill-btn').forEach(btn => {
        btn.onclick = () => {
            sessionStorage.setItem('selectedSkill', btn.innerText.trim());
            sessionStorage.setItem('selectedJob', title);
            window.location.href = "../outline/outline.html";
        };
    });
}