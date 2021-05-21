const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: 5432,
});

const runQuery = (query) => {
  return pool.query(query);
};

module.exports = runQuery;
