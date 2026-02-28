const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const appKey = process.env.app_key;
const idKey = process.env.app_id;

const app = express();
const PORT = 3000;

const pool = require("./db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

pool.query("SELECT NOW()")
  .then(res => {
    console.log("DB connected:", res.rows[0]);
  })
  .catch(err => {
    console.error("DB connection error:", err);
  });

  app.use(express.json());

// Serve static files (HTML, client JS)
app.use(express.static('public'));

// API route
app.get('/api/jobs', async (req, res) => {
    const role = "";
    try {
        const response = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${idKey}&app_key=${appKey}&what=${encodeURIComponent(role)}&results_per_page=8`);
        const data = await response.json();
        res.json(data.results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/register", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const hashed = await bcrypt.hash(password, 10);
  
      const result = await pool.query(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id, email`,
        [email, hashed]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
    if (err.code === "23505") {
        return res.status(400).json({ error: "Email already exists" });
      }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );
  
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const user = result.rows[0];
  
      const valid = await bcrypt.compare(password, user.password_hash);
  
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  });

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  }

  app.post("/api/skills", authenticate, async (req, res) => {
    try {
      const { skill_name } = req.body;
  
      const result = await pool.query(
        `INSERT INTO skills (user_id, skill_name)
         VALUES ($1, $2)
         RETURNING *`,
        [req.userId, skill_name]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add skill" });
    }

    if (!skill_name || skill_name.length < 2) {
        return res.status(400).json({ error: "Invalid skill name" });
      }
  });

  app.get("/api/skills", authenticate, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM skills
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [req.userId]
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  });

app.post("/api/save-job", async (req, res) => {
    try {
      const { job_title, company, location, adzuna_id } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
  
      const result = await pool.query(
        `
        INSERT INTO saved_jobs (job_title, company, location, adzuna_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [job_title, company, location, adzuna_id]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/saved-jobs", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM saved_jobs ORDER BY saved_at DESC`
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });