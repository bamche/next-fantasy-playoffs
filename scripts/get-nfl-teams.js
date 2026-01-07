// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const axios = require('axios');
const pg = require('pg');
const format = require('pg-format');

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

/**
 * Script to fetch and save NFL teams from ESPN API to PostgreSQL database
 * This script fetches all NFL teams, logs their information, and saves them to the database
 */
async function getNflTeams() {
  const client = new pg.Client(config);
  
  try {
    // Connect to the database
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!\n');
    
    // Fetch teams from ESPN API
    const url = 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams';
    console.log('Fetching NFL teams from ESPN API...');
    const response = await axios.get(url);
    const teams = response.data.sports[0].leagues[0].teams;
    
    // Prepare data for database insertion
    const teamData = teams.map(({ team }) => {
      // Log team information
      console.log({
        id: team.id,
        abbreviation: team.abbreviation,
        name: team.name,
        isActive: team.isActive,
        slug: team.slug,
        color: team.color,
        alternateColor: team.alternateColor
      });
      
      return [
        team.id,
        team.abbreviation,
        team.name,
        team.isActive,
        team.slug,
        team.color,
        team.alternateColor
      ];
    });
    
    // Insert teams into database using ON CONFLICT to update if exists
    const SQLQueryString = `INSERT INTO public.all_nfl_teams 
      (id, abbreviation, name, is_active, slug, color, alternate_color) 
      VALUES %L 
      ON CONFLICT (id) 
      DO UPDATE 
        SET abbreviation = excluded.abbreviation,
            name = excluded.name,
            is_active = excluded.is_active,
            slug = excluded.slug,
            color = excluded.color,
            alternate_color = excluded.alternate_color;`;
    
    const formatString = format(SQLQueryString, teamData);
    await client.query(formatString);
    
    console.log(`\n✅ Successfully fetched and saved ${teams.length} NFL teams to database`);
    
  } catch (error) {
    console.error('\n❌ Error fetching/saving NFL teams:');
    console.error(error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    process.exit(1);
  } finally {
    // Close the connection
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the script
getNflTeams();

