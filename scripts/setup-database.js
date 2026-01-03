// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from environment variables
// Validate that required environment variables are set
const requiredEnvVars = ['DB_user', 'DB_password', 'DB_host', 'DB_port', 'DB_database'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPlease ensure you have a .env file in the project root with these variables set.');
  process.exit(1);
}

const config = {
  user: process.env.DB_user,
  password: process.env.DB_password,
  host: process.env.DB_host,
  port: process.env.DB_port,
  database: process.env.DB_database,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function setupDatabase() {
  const client = new pg.Client(config);
  
  try {
    // Connect to the database
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'nfl_challenge_create.sql');
    console.log(`Reading SQL file: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at: ${sqlFilePath}`);
    }

    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Remove comments and split by semicolons, but be careful with semicolons in strings
    // For simplicity, we'll split by semicolon followed by newline or whitespace
    // This works for most SQL files
    const statements = sql
      .split(/;\s*\n/)
      .map(stmt => {
        // Remove single-line comments
        return stmt
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
      })
      .filter(stmt => stmt.length > 0 && !stmt.match(/^--/));

    console.log(`Found ${statements.length} SQL statements to execute...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements or comment-only statements
      if (!statement || statement.trim().length === 0) {
        continue;
      }

      try {
        // Add semicolon back if not present
        const sqlStatement = statement.endsWith(';') ? statement : statement + ';';
        console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
        await client.query(sqlStatement);
        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Some errors (like "table already exists") might be acceptable
        if (error.message.includes('already exists') || error.code === '42P07') {
          console.log(`⚠ Statement ${i + 1} skipped: ${error.message}`);
        } else {
          console.error(`\n❌ Error in statement ${i + 1}:`);
          console.error(`SQL: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    console.log('\n✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:');
    console.error(error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    // Close the connection
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the setup
setupDatabase();

