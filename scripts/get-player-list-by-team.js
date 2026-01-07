// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const axios = require('axios');
const pg = require('pg');

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
 * Script to get player list by team abbreviation
 * Fetches roster from ESPN API and filters for offensive skill position players
 */
async function getPlayerListByTeam(teamAbbreviation) {
  const client = new pg.Client(config);
  
  try {
    // 1. Validate input - must be a 3-letter string
    if (!teamAbbreviation || typeof teamAbbreviation !== 'string' || (teamAbbreviation.length !== 2 && teamAbbreviation.length !== 3)) {
      console.warn(`⚠️  Warning: Input must be a 2 or 3 letter team abbreviation (e.g., "TB", "NYG"). Received: "${teamAbbreviation}"`);
      throw new Error(`Invalid team abbreviation: ${teamAbbreviation}`);
    }

    // Normalize to uppercase for database lookup
    const abbreviation = teamAbbreviation.toUpperCase();

    // Connect to the database
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!\n');

    // 2. Get NFL team ID from all_nfl_teams table based on abbreviation
    console.log(`Looking up team ID for abbreviation: ${abbreviation}`);
    const teamQuery = 'SELECT id FROM public.all_nfl_teams WHERE abbreviation = $1';
    const teamResult = await client.query(teamQuery, [abbreviation]);

    if (teamResult.rows.length === 0) {
      console.error(`❌ No team found with abbreviation: ${abbreviation}`);
      throw new Error(`No team found with abbreviation: ${abbreviation}`);
    }

    const teamId = teamResult.rows[0].id;
    console.log(`Found team ID: ${teamId}\n`);

    // 3. Call ESPN API to get roster
    const url = `https://site.api.espn.com/apis/common/v3/sports/football/nfl/teams/${teamId}/roster`;
    console.log(`Fetching roster from: ${url}`);
    const response = await axios.get(url);
    console.log('Roster fetched successfully!\n');

    // 4. Filter athletes based on criteria
    const positionGroups = response.data.positionGroups || [];
    const offenseGroup = positionGroups.find(group => group.type === 'offense');
    const specialTeamsGroup = positionGroups.find(group => group.type === 'specialTeam');
    const validPositions = ['QB', 'WR', 'TE', 'RB', 'PK'];
    const filteredAthletes = offenseGroup.athletes.concat(specialTeamsGroup.athletes).filter(athlete => {
      // Check if athlete is on offense (already filtered by offenseGroup)
      // Check if position abbreviation is valid
      const positionAbbr = athlete.position?.abbreviation;
      if (!validPositions.includes(positionAbbr)) {
        return false;
      }
      
      // Check if status id is not 29
      const statusId = athlete.status?.id;
      if (statusId === '29' || statusId === 29) {
        return false;
      }
      
      return true;
    });

    console.log(`Found ${filteredAthletes.length} matching athletes:\n`);
    
    // Insert each player into player_list table
    for (const athlete of filteredAthletes) {
      const playerId = athlete.id;
      const playerName = athlete.displayName;
      const position = athlete.position?.abbreviation === 'PK' ? 'K' : athlete.position?.abbreviation;
      
      // Log the athlete
      console.log({
        displayName: playerName,
        id: playerId,
        'position.abbreviation': position
      });
      
      // Insert or update player in player_list table
      const insertPlayerQuery = `
        INSERT INTO public.player_list (player_id, player_name, position, nfl_team)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (player_id)
        DO UPDATE SET
          player_name = EXCLUDED.player_name,
          position = EXCLUDED.position,
          nfl_team = EXCLUDED.nfl_team
      `;
      
      await client.query(insertPlayerQuery, [playerId, playerName, position, teamId]);
    }
    
    console.log(`\n✅ Successfully inserted/updated ${filteredAthletes.length} players in player_list table`);
    
    // 6. Insert or update entry in def_list table
    const insertDefQuery = `
      INSERT INTO public.def_list (def_id, nfl_team)
      VALUES ($1, $2)
      ON CONFLICT (def_id)
      DO UPDATE SET
        nfl_team = EXCLUDED.nfl_team
    `;
    
    await client.query(insertDefQuery, [teamId, abbreviation]);
    console.log(`✅ Successfully inserted/updated defense entry for team ${abbreviation} (ID: ${teamId}) in def_list table`);

  } catch (error) {
    console.error('\n❌ Error getting player list:');
    console.error(error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    throw error; // Re-throw to allow caller to handle
  } finally {
    // Close the connection
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Export the function for use in other scripts
module.exports = { getPlayerListByTeam };

// Only run if this script is executed directly (not imported)
if (require.main === module) {
  // Get team abbreviation from command line arguments
  const teamAbbreviation = process.argv[2];

  if (!teamAbbreviation) {
    console.error('❌ Please provide a team abbreviation as an argument');
    console.error('Usage: node scripts/get-player-list-by-team.js <TEAM_ABBREVIATION>');
    console.error('Example: node scripts/get-player-list-by-team.js TB');
    process.exit(1);
  }

  // Run the script
  getPlayerListByTeam(teamAbbreviation).catch(error => {
    process.exit(1);
  });
}

