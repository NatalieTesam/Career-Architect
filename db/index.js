const { Pool } = require("pg");

const pool = new Pool({
  user: "alanbassett",
  host: "localhost",
  database: "career_architect",
  password: "",
  port: 5432,
});

module.exports = pool;