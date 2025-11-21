// Server-only database client - DO NOT IMPORT IN CLIENT COMPONENTS
// Load environment variables
require('dotenv').config();

const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon DB
  }
});

// Simple query function
async function query(text, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  pool
};
