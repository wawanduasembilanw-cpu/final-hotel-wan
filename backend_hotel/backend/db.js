const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "hotel_dbwan",
  password: process.env.PGPASSWORD || "00000",
  port: process.env.PGPORT || 5432,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

module.exports = pool;