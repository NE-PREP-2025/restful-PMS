const mysql = require('mysql2');
require('dotenv').config();

// Create a MySQL connection pool using .env variables
const Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Default connection limit
  queueLimit: 0,
});

// Export a promise-based pool for async/await use
const pool = Pool.promise();

module.exports = pool;
