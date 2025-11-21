const { query } = require('./neon.js');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Simple query to test connection
    const result = await query('SELECT NOW() as current_time');
    
    console.log('Connection successful!');
    console.log('Current database time:', result.rows[0].current_time);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  testConnection()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testConnection;
