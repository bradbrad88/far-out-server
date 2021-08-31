const { Pool } = require("pg");
require("dotenv").config();
const env = process.env.NODE_ENV || "development";
console.log(env);
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: env === "development" ? null : { rejectUnauthorized: false },
});

const runQuery = async query => {
  return await pool.query(query);
};

module.exports = runQuery;
