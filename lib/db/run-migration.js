// Load environment variables
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { query, pool } = require('./neon.js');

async function runMigration() {
    try {
        console.log('Running migration...');

        // Read migration SQL file
        const migrationPath = path.join(process.cwd(), 'lib', 'db', 'migrations', '002_add_settings_and_job.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing SQL:', migrationSql);

        // Execute migration SQL
        await query(migrationSql);

        console.log('Migration applied successfully!');
    } catch (error) {
        console.error('Error running migration:', error);
    } finally {
        // Close the pool to allow the script to exit
        await pool.end();
    }
}

runMigration();
