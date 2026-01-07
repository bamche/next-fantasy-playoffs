// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { getPlayerListByTeam } = require('./get-player-list-by-team');

/**
 * Script to get player list for multiple teams
 * Takes a comma-separated string of team abbreviations and processes each one
 */
async function getPlayerListByTeams(teamAbbreviationsString) {
  if (!teamAbbreviationsString || typeof teamAbbreviationsString !== 'string') {
    console.error('❌ Please provide a comma-separated string of team abbreviations');
    console.error('Usage: node scripts/get-player-list-by-teams.js <TEAM1,TEAM2,TEAM3>');
    console.error('Example: node scripts/get-player-list-by-teams.js TB,NYG,KC');
    process.exit(1);
  }

  // Split the comma-separated string and trim whitespace
  const abbreviations = teamAbbreviationsString
    .split(',')
    .map(abbr => abbr.trim())
    .filter(abbr => abbr.length > 0);

  if (abbreviations.length === 0) {
    console.error('❌ No valid team abbreviations found in input');
    process.exit(1);
  }

  console.log(`Processing ${abbreviations.length} team(s): ${abbreviations.join(', ')}\n`);

  // Process each team abbreviation
  for (let i = 0; i < abbreviations.length; i++) {
    const abbreviation = abbreviations[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing team ${i + 1}/${abbreviations.length}: ${abbreviation}`);
    console.log('='.repeat(60));

    try {
      await getPlayerListByTeam(abbreviation);
      console.log(`\n✅ Successfully processed team: ${abbreviation}`);
    } catch (error) {
      console.error(`\n❌ Failed to process team: ${abbreviation}`);
      console.error(`Error: ${error.message}`);
      // Continue processing other teams even if one fails
    }

    // Add a separator between teams (except after the last one)
    if (i < abbreviations.length - 1) {
      console.log('\n');
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Finished processing ${abbreviations.length} team(s)`);
  console.log('='.repeat(60));
}

// Get comma-separated team abbreviations from command line arguments
const teamAbbreviationsString = process.argv[2];

if (!teamAbbreviationsString) {
  console.error('❌ Please provide a comma-separated string of team abbreviations');
  console.error('Usage: node scripts/get-player-list-by-teams.js <TEAM1,TEAM2,TEAM3>');
  console.error('Example: node scripts/get-player-list-by-teams.js TB,NYG,KC');
  process.exit(1);
}

// Run the script
getPlayerListByTeams(teamAbbreviationsString).catch(error => {
  console.error('\n❌ Fatal error in getPlayerListByTeams:');
  console.error(error.message);
  process.exit(1);
});




