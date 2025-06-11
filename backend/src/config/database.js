const { Pool } = require('pg');
require('dotenv/config'); // Ensure environment variables are loaded

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  // Optional: SSL configuration for secure connections
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Test the connection (optional, but good for immediate feedback)
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client for DB connection test:', err.stack);
    // Consider using a logger here once it's set up
    // logger.error('Error acquiring client for DB connection test:', err.stack);
    return;
  }
  console.log('Successfully connected to the PostgreSQL database.');
  // logger.info('Successfully connected to the PostgreSQL database.');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if direct access is needed
};
