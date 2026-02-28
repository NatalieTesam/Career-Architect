import { loadHeaderFooter } from "../scripts/utils.mjs";



const FEDORA_IP = "100.94.140.36"; 
const API_URL = `http://${FEDORA_IP}:1234/v1/chat/completions`;

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeaderFooter();
    const rawData = sessionStorage.getItem('learningPlan');
    
    

    // Safety check for session storage
    if (!rawData) {
        document.getElementById('checklist-container').innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h2>No Skill Selected</h2>
                <p>Please return to the skills page and select a career path first.</p>
            </div>`;
        return;
    }

    const planData = JSON.parse(rawData);
    document.getElementById('skill-name-display').textContent = `Roadmap: ${planData.skill}`;
    
    const container = document.getElementById('checklist-container');
    container.innerHTML = "<div class='loading'>Consulting with the Senior Architect...</div>";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "google/gemma-3-1b-it",
                messages: [
                    { 
                        role: "system", 
                        content: `You are a Senior Technical Architect. Create a high-quality project roadmap for learning ${planData.skill}.
                        
                        REQUIREMENTS:
                        1. Accuracy: Use real-world 2026 tools, specific libraries, and actual commands.
                        2. Depth: Do not use generic steps. Provide specific technical tasks (e.g., "Implement OAuth2" instead of "Add login").
                        3. Structure: Return ONLY a JSON object.
                        
                        JSON SCHEMA:
                        {
                          "projectTitle": "Specific Project Name",
                          "phases": [
                            { "name": "Phase 1 Title", "tasks": ["Specific Task 1", "Specific Task 2"] }
                          ]
                        }
                        Create exactly 3 phases.` 
                    },
                    { 
                        role: "user", 
                        content: `Skill: ${planData.skill}. Goal: ${planData.notes}. Level: ${planData.difficulty}. Time: ${planData.durationNumber} ${planData.durationUnit}.` 
                    }
                ],
                temperature: 0.4 // Balanced for technical accuracy and JSON reliability
            })
        });

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Clean common AI formatting errors (Markdown blocks)
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        const roadmap = JSON.parse(content.substring(start, end + 1));
        
        renderRoadmap(roadmap);
        initStreamingChat(); 

    } catch (err) {
        console.error("Architect Error:", err);
        container.innerHTML = "<p>Error: The AI server is struggling with that request. Please try refreshing.</p>";
    }
});

function renderRoadmap(data) {
    const container = document.getElementById('checklist-container');
    container.innerHTML = `<h2 style="color: #1e293b; margin-bottom: 25px;">${data.projectTitle}</h2>`;

    data.phases.forEach((phase, idx) => {
        const card = document.createElement('div');
        card.className = 'phase-card';
        card.style = "background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);";
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">
                <input type="checkbox" class="phase-check" id="check-${idx}" style="width: 22px; height: 22px; cursor: pointer;">
                <h3 style="margin: 0;">${phase.name}</h3>
            </div>
            <ul style="list-style: none; padding-left: 15px;">
                ${phase.tasks.map(t => `<li style="margin-bottom: 10px; color: #475569; font-family: monospace; font-size: 0.95rem;">> ${t}</li>`).join('')}
            </ul>
        `;
        container.appendChild(card);
    });

    setupProgressLogic();
}

async function initStreamingChat() {
    if (document.getElementById('chat-box')) return;

    const chatHTML = `
        <div id="chat-box" style="margin-top: 50px; padding: 25px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <div id="chat-output" style="max-height: 400px; overflow-y: auto; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 15px;">
                <p style="color: #94a3b8;"><em>Ask the Architect a follow-up question...</em></p>
            </div>
            <div class="chat-input-row" style="display: flex; gap: 12px;">
                <input type="text" id="user-question" placeholder="How do I configure the environment?" style="flex-grow: 1; padding: 12px; border-radius: 8px; border: none; color: #000;">
                <button id="send-btn" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Ask AI</button>
            </div>
        </div>`;
    
    document.querySelector('main').insertAdjacentHTML('beforeend', chatHTML);

    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('user-question');
    const output = document.getElementById('chat-output');

    sendBtn.onclick = async () => {
        const question = input.value.trim();
        if (!question) return;

        output.innerHTML += `<p style="color: #3b82f6;"><strong>You:</strong> ${question}</p><p><strong>AI:</strong> <span id="current-response"></span></p>`;
        const responseSpan = document.getElementById('current-response');
        input.value = "";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "google/gemma-3-1b-it",
                    messages: [{ role: "user", content: question }],
                    stream: true 
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') break;
                        try {
                            const json = JSON.parse(dataStr);
                            const content = json.choices[0].delta.content;
                            if (content) {
                                fullText += content;
                                responseSpan.innerHTML = formatMarkdown(fullText);
                                output.scrollTop = output.scrollHeight;
                            }
                        } catch (e) {}
                    }
                }
            }
            responseSpan.removeAttribute('id'); 
        } catch (err) {
            output.innerHTML += `<p style="color: #ef4444;">Connection lost.</p>`;
        }
    };
}

function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function setupProgressLogic() {
    const checkboxes = Array.from(document.querySelectorAll('.phase-check'));
    const progress = document.getElementById('skill-progress');
    const percent = document.getElementById('progress-percent');
    const text = document.getElementById('progress-text');

    function update() {
        const checked = checkboxes.filter(cb => cb.checked).length;
        const total = checkboxes.length;
        if (progress) progress.value = checked;
        if (progress) progress.max = total;
        if (percent) percent.textContent = `${Math.ceil((checked / total) * 100)}%`;
        if (text) text.textContent = `${checked} / ${total}`;
    }

    checkboxes.forEach(cb => cb.addEventListener('change', update));
    update();
}