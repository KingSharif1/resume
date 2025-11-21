// Load environment variables
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { query } = require('./neon.js');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read schema SQL file
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    await query(schemaSql);
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
