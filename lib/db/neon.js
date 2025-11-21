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

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to Neon DB:', err);
  } else {
    console.log('Connected to Neon DB at:', res.rows[0].now);
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
