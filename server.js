const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const appKey = process.env.app_key;
const idKey = process.env.app_id;

const app = express();
const PORT = 3000;

// Serve static files (HTML, client JS)
app.use(express.static('public'));

// API route
app.get('/api/jobs', async (req, res) => {
    const role = req.query.role || 'developer';
    try {
        const response = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${idKey}&app_key=${appKey}&what=${encodeURIComponent(role)}&results_per_page=3`);
        const data = await response.json();
        res.json(data.results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// app.get('/api/jobs', async (req, res) => {
//     const role = req.query.role || 'developer';
//     try {
//         const response = await fetch(`https://example.com/jobs?role=${role}`, {
//             headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
//         });
//         const data = await response.json();
//         res.json(data);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));