const axios = require('axios');
const format = require('pg-format');
import db from '../../../lib/pgClient';
import redisClient from '../../../lib/redisClient';
import { 
    updateUserListPointsQuery, 
    updateUserDefPointsQuery, 
    offStatRecordPoints, 
    WEEK_1_END_DATE, 
    WEEK_2_END_DATE, 
    WEEK_3_END_DATE
} from '../../../utils/constants';
import ESPNClient from '../../../lib/apiClients/ESPNClient';

export default async function getGameStatsESPN(req, res) {
    const espnClient = new ESPNClient();

    const gameId = req.query.gameId;
    const gameEvent = await espnClient.getGameEvent(gameId);
    const week = determineGameWeek(gameEvent);
    const {teamIds, loserId} = extractTeamInfo(gameEvent);
    const teamPlayerIds = await getPlayerIdsByTeams(teamIds);
    const playerIdToPositionMap = await getPlayerIdToPositionMap(teamPlayerIds);
    const playerIdToNflTeamMap = await getPlayerIdToNflTeamMap(teamPlayerIds);
    const teamStatsResponses = {};
    for (const teamId of teamIds) {
        teamStatsResponses[teamId] = await espnClient.getTeamStatistics(gameId, teamId);
    }

    const parsedTeamStats = parseTeamStatistics(teamStatsResponses, teamIds);
    const playerStats = await espnClient.getPlayerStatistics(gameId, teamPlayerIds);
    try {
        await redisClient.flushDb();
        console.log('All caches invalidated (current database).');
    } catch(e){
        console.log(`get-game-stats cache error:  ${e}`);
        res.status(500).send(e);
    };

    try {
        if (week != '1' && week != '2' && week != '3' && week != '4') {
            throw new Error("Incorrect week format");
        } 

        const playerStatsLog =  updatePlayerStats(playerStats, playerIdToPositionMap, playerIdToNflTeamMap, week);
        const defenseStatsLog = updatDefenseStats(week, parsedTeamStats, teamIds);
        const kickerStatsLog = updateKickerStats(week, parsedTeamStats);
        const eliminatedLog =  updateEliminated(loserId);

        Promise.all([playerStatsLog, defenseStatsLog, kickerStatsLog, eliminatedLog]);
        await updateUserListPoints();
        res.status(200).send({ playerStatsLog, defenseStatsLog, kickerStatsLog });
    } catch(e){
        console.log(`get-game-stats api error:  ${e}`);
        res.status(500).send(e);
    };

};

async function updatePlayerStats(playerStats, playerIdToPositionMap, playerIdToNflTeamMap, week) {
    try{
        const superBowlFactor =  week === 4 ? 1.5 : 1;
        const sortedPlayerStats = [];
        
        Object.entries(playerStats).forEach(([playerId, playerStat]) =>{
            console.log("playerId", playerId);
            console.log("playerStat", playerStat);
            const position = playerIdToPositionMap[playerId];
            const nfl_team = playerIdToNflTeamMap[playerId];
            
            // Skip players without nfl_team mapping to avoid NOT NULL constraint violation
            if (!nfl_team) {
                console.warn(`Skipping player ${playerId} - no nfl_team mapping found`);
                return;
            }
            
            const player_id = playerId;
            const pass_yd = (position === "K" ? 0 : playerStat.passingYards);
            const pass_td = (position === "K" ? 0 : playerStat.passingTouchdowns);
            const interception = (position === "K" ? 0 : playerStat.interceptions);
            const rush_yd = (position === "K" ? 0 : playerStat.rushingYards);
            const rush_td = (position === "K" ? 0 : playerStat.rushingTouchdowns);
            const rec_yd = (position === "K" ? 0 : playerStat.receivingYards);
            const rec_td = (position === "K" ? 0 : playerStat.receivingTouchdowns);
            const rec = ((position === "K" || position === "TE") ? 0 : playerStat.receptions);
            const te_rec = (position === "TE" ? playerStat.receptions : 0);
            const two_pt = (position === "K" ? 0 : playerStat.twoPtPass);
            const fg30 = 0;
            const fg40 = 0;
            const fg50 = 0;
            const xtpm = 0;
            const points = ( 
                pass_yd * offStatRecordPoints['pass_yd'] + 
                pass_td * offStatRecordPoints['pass_td'] + 
                interception * offStatRecordPoints['interception'] + 
                rush_yd * offStatRecordPoints['rush_yd'] + 
                rush_td * offStatRecordPoints['rush_td'] + 
                rec_yd * offStatRecordPoints['rec_yd'] + 
                rec_td * offStatRecordPoints['rec_td'] + 
                rec * offStatRecordPoints['rec'] + 
                te_rec * offStatRecordPoints['te_rec'] + 
                two_pt * offStatRecordPoints['two_pt'] + 
                fg30 * 3 + fg40 * 4 + fg50 * 5 + xtpm * 1
                ) * superBowlFactor;
              console.log("points", points);
            sortedPlayerStats.push(
                [player_id, nfl_team, pass_yd, pass_td, interception, rush_yd, rush_td, 
                rec_yd, rec_td, rec, te_rec, two_pt, fg30, fg40, fg50, xtpm, points]
                );
        })

        const SQLQueryString = `INSERT INTO public.player_list 
        (player_id, nfl_team, pass_yd${week}, pass_td${week}, interception${week}, rush_yd${week}, rush_td${week}, 
        rec_yd${week}, rec_td${week}, rec${week}, te_rec${week}, two_pt${week}, fg30${week}, fg40${week}, fg50${week}, xtpm${week}, points${week}) 
        VALUES %L 
        ON CONFLICT (player_id) 
        DO UPDATE 
          SET pass_yd${week} = excluded.pass_yd${week}, 
              pass_td${week} = excluded.pass_td${week}, 
              interception${week} = excluded.interception${week},
              rush_yd${week} = excluded.rush_yd${week}, 
              rush_td${week} = excluded.rush_td${week}, 
              rec_yd${week} = excluded.rec_yd${week}, 
              rec_td${week} = excluded.rec_td${week}, 
              rec${week} = excluded.rec${week}, 
              te_rec${week} = excluded.te_rec${week}, 
              two_pt${week} = excluded.two_pt${week}, 
              fg30${week} = excluded.fg30${week}, 
              fg40${week} = excluded.fg40${week}, 
              fg50${week} = excluded.fg50${week}, 
              xtpm${week} = excluded.xtpm${week},
              points${week} = excluded.points${week};` 

        const formatString = format(SQLQueryString, sortedPlayerStats);

        await db.query(formatString);
        return "SQL operation complete: " + formatString;
    } catch(e) {
        console.log(`get-game-stats api error (updatePlayerStats):  ${e}`);
    }
};

async function updatDefenseStats(week, parsedTeamStats, teamIds) {
  const superBowlFactor = week === 4 ? 1.5 : 1;
  const sortedDefenseStats = [];
  
  Object.entries(parsedTeamStats).forEach(([teamId, teamStat]) => {
    const sacks = teamStat.sacks;
    const fumblesRecovered = getFumblesRecovered(teamId, parsedTeamStats, teamIds);
    const turnovers = teamStat.interceptions + fumblesRecovered;
    const blocks = teamStat.kicksBlocked;
    const safeties = teamStat.safeties;
    const touchdowns = teamStat.defensiveTouchdowns;
    const pointsAllowed = teamStat.pointsAllowed;
    const points = (sacks * 1 + turnovers * 2 + blocks * 2 + safeties * 5 + touchdowns * 6 + calculatePointsAllowedScore(pointsAllowed)) * superBowlFactor;

    sortedDefenseStats.push([teamId, sacks, turnovers, blocks, safeties, touchdowns, pointsAllowed, points]);
  });

  try{
      const SQLQueryString = `INSERT INTO def_list 
        (def_id, sack${week},	turnover${week}, block_ret${week}, sfty${week},	td${week}, pts_allowed${week}, points${week}) 
        VALUES %L 
        ON CONFLICT (def_id) 
        DO UPDATE 
          SET sack${week} = excluded.sack${week},	
          turnover${week} = excluded.turnover${week},	
          block_ret${week} = excluded.block_ret${week},	
          sfty${week} = excluded.sfty${week},	
          td${week} = excluded.td${week},	
          pts_allowed${week} = excluded.pts_allowed${week},
          points${week} = excluded.points${week};` 

      const formatString = format(SQLQueryString, sortedDefenseStats);
      console.log("formatString", formatString);
      await db.query(formatString);
      return "SQL operation complete: " + formatString;
  } catch(e) {
      console.log(`get-game-stats api error (updateDefenseStats):  ${e}`);
  }
};

async function updateKickerStats(week, parsedTeamStats) {
  const superBowlFactor = week === 4 ? 1.5 : 1;
  const sortedKickerStats = [];
  
  // Process each team's kicking stats
  for (const [teamId, teamStat] of Object.entries(parsedTeamStats)) {
    // Find kicker(s) associated with this NFL team
    const query = `
      SELECT player_id
      FROM public.player_list 
      WHERE nfl_team = $1 AND position = 'K'
    `;
    
    const result = await db.query(query, [teamId]);
    const kickers = result.rows;
    
    if (kickers.length === 0) {
      console.warn(`No kickers found for team ${teamId}`);
      continue;
    }
    console.log("kickers", kickers);
    // Map team stats to kicker stats
    // fg30 = field goals 1-39 yards (1_19 + 20_29 + 30_39)
    const fg30 = (teamStat.fieldGoalsMade1_19 || 0) + 
                 (teamStat.fieldGoalsMade20_29 || 0) + 
                 (teamStat.fieldGoalsMade30_39 || 0);
    // fg40 = field goals 40-49 yards
    const fg40 = teamStat.fieldGoalsMade40_49 || 0;
    // fg50 = field goals 50+ yards
    const fg50 = teamStat.fieldGoalsMade50 || 0;
    // xtpm = extra points made
    const xtpm = teamStat.extraPointsMade || 0;
    
    // Calculate points: fg30 * 3 + fg40 * 4 + fg50 * 5 + xtpm * 1
    const points = (fg30 * 3 + fg40 * 4 + fg50 * 5 + xtpm * 1) * superBowlFactor;
    
    // Update each kicker for this team with the same stats
    kickers.forEach(kicker => {
      sortedKickerStats.push([kicker.player_id, teamId, fg30, fg40, fg50, xtpm, points]);
    });
  }
  
  if (sortedKickerStats.length === 0) {
    return "No kicker stats to update";
  }
  
  try {
    const SQLQueryString = `INSERT INTO public.player_list 
      (player_id, nfl_team, fg30${week}, fg40${week}, fg50${week}, xtpm${week}, points${week}) 
      VALUES %L 
      ON CONFLICT (player_id) 
      DO UPDATE 
        SET fg30${week} = excluded.fg30${week}, 
            fg40${week} = excluded.fg40${week}, 
            fg50${week} = excluded.fg50${week}, 
            xtpm${week} = excluded.xtpm${week},
            points${week} = excluded.points${week};` 
    
    const formatString = format(SQLQueryString, sortedKickerStats);
    console.log("Kicker stats formatString", formatString);
    await db.query(formatString);
    return "SQL operation complete: " + formatString;
  } catch(e) {
    console.log(`get-game-stats api error (updateKickerStats):  ${e}`);
    throw e;
  }
};

async function updateEliminated(teamId) {
    const queryString = `UPDATE public.player_list
                        SET eliminated = true
                        WHERE nfl_team = $1;` 
    const playerQuery = db.query(queryString, [teamId]);
    
    const defQueryString = `UPDATE public.def_list
                           SET eliminated = true
                           WHERE def_id = $1;` 
    const defQuery = db.query(defQueryString, [teamId]);
    
    const [playerResult, defResult] = await Promise.all([playerQuery, defQuery]);
    
    return "SQL operation complete: " + playerResult + " " + defResult;
}

async function updateUserListPoints() {
    const emailQueryString = `SELECT email FROM public.user_list;`
    const emailList = (await db.query(emailQueryString)).rows;
          
    for(const email of emailList) {
        console.log(email)
        await db.query(updateUserListPointsQuery(email.email));
        await db.query(updateUserDefPointsQuery(email.email));
    }
}


function calculatePointsAllowedScore (pointsAllowed) {
  if(pointsAllowed === null){
      return 0;
  } else if(pointsAllowed === 0 ){
      return 12;
  } else if(pointsAllowed < 7){
      return 8;
  } else if(pointsAllowed < 11){
      return 5;
  } else if( pointsAllowed < 18) {
      return 2;
  } else {
      return 0;
  }
}

function getFumblesRecovered(teamId, parsedTeamStats, teamIds) {
// Find the opposing team
const opposingTeamId = teamIds.find(id => id !== teamId);
if (!opposingTeamId) {
  return 0;
}

// Fumbles recovered = opposing team's fumbles lost
const opposingTeamStats = parsedTeamStats[opposingTeamId];
return opposingTeamStats?.fumblesLost || 0;
}

function extractTeamInfo(gameEvent) {
  const competitions = gameEvent?.competitions;
  if (!competitions || competitions.length === 0) {
    throw new Error('No competitions found in game event data');
  }

  const competitors = competitions[0]?.competitors;
  if (!competitors || competitors.length < 2) {
    throw new Error('Invalid competitors data in game event');
  }

  const teamIds = competitors.map(competitor => competitor.id);
  const loser = competitors.find(competitor => competitor.winner === false);
  const loserId = loser ? loser.id : null;

  return {
    teamIds,
    loserId
  };
}

function determineGameWeek(gameEvent) {
    const gameDate = gameEvent?.date;
    if(!gameDate) {
        throw new Error('No date found in game event data');
    }
    const gameDateTime = Date.parse(gameDate);
    if(gameDateTime < Date.parse(WEEK_1_END_DATE)) {
        return 1;
    } else if(gameDateTime < Date.parse(WEEK_2_END_DATE)) {
        return 2;
    } else if(gameDateTime < Date.parse(WEEK_3_END_DATE)) {
        return 3;
    } else {
        return 4;
    }
}

async function getPlayerIdsByTeams(teamIds) {
    try {
      // Convert teamIds to a format suitable for SQL IN clause
      const teamIdsPlaceholder = teamIds.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT player_id, nfl_team
        FROM public.player_list 
        WHERE nfl_team IN (${teamIdsPlaceholder})
      `;
      
      const result = await db.query(query, teamIds);
      
      // Group player IDs by team
      const teamPlayerIds = {};
      teamIds.forEach(teamId => {
        teamPlayerIds[teamId] = [];
      });
      
      result.rows.forEach(row => {
        const teamId = String(row.nfl_team); // Ensure string comparison
        if (teamPlayerIds[teamId]) {
          teamPlayerIds[teamId].push(row.player_id);
        }
      });
      
      return teamPlayerIds;
    } catch (error) {
      console.error('Error fetching player IDs by teams:', error);
      throw new Error(`Failed to fetch player IDs: ${error.message}`);
    }
  }

async function getPlayerIdToPositionMap(teamPlayerIds) {
    try {
      // Flatten all playerIds from all teams into a single array
      const allPlayerIds = [];
      Object.values(teamPlayerIds).forEach(playerIds => {
        allPlayerIds.push(...playerIds);
      });
      
      if (allPlayerIds.length === 0) {
        return {};
      }
      
      // Convert playerIds to a format suitable for SQL IN clause
      const playerIdsPlaceholder = allPlayerIds.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT player_id, position
        FROM public.player_list 
        WHERE player_id IN (${playerIdsPlaceholder})
      `;
      
      const result = await db.query(query, allPlayerIds);
      
      // Create a map of playerId to position
      const playerIdToPositionMap = {};
      result.rows.forEach(row => {
        playerIdToPositionMap[row.player_id] = row.position;
      });
      
      return playerIdToPositionMap;
    } catch (error) {
      console.error('Error fetching player ID to position mapping:', error);
      throw new Error(`Failed to fetch player positions: ${error.message}`);
    }
  }

async function getPlayerIdToNflTeamMap(teamPlayerIds) {
    try {
      // Create a reverse mapping from teamPlayerIds (teamId -> [playerIds])
      const playerIdToNflTeamMap = {};
      
      Object.entries(teamPlayerIds).forEach(([teamId, playerIds]) => {
        playerIds.forEach(playerId => {
          playerIdToNflTeamMap[playerId] = teamId;
        });
      });
      
      return playerIdToNflTeamMap;
    } catch (error) {
      console.error('Error creating player ID to NFL team mapping:', error);
      throw new Error(`Failed to create player to team mapping: ${error.message}`);
    }
  }

/**
 * Parse defensive and kicking stats from ESPN team statistics response
 * @param {Object} teamStatisticsResponses - Object mapping team ID to their statistics response
 * @param {Array<string>} teamIds - Array of team IDs
 * @returns {Object} Object mapping team ID to their parsed stats
 */
function parseTeamStatistics(teamStatisticsResponses, teamIds) {
  const parsedStats = {};
  
  // Stats to extract from the response
  const statsToExtract = {
    defensive: [
      'defensiveTouchdowns',
      'kicksBlocked',
      'twoPtReturns',
      'sacks',
      'safeties',
      'pointsAllowed'
    ],
    defensiveInterceptions: [
      'interceptions'
    ],
    kicking: [
      'extraPointsMade',
      'fieldGoalsMade1_19',
      'fieldGoalsMade20_29',
      'fieldGoalsMade30_39',
      'fieldGoalsMade40_49',
      'fieldGoalsMade50'
    ],
    general: [
      'fumblesLost'
    ]
  };
  
  // Process each team's statistics
  teamIds.forEach(teamId => {
    const teamResponse = teamStatisticsResponses[teamId];
    
    if (!teamResponse) {
      console.warn(`No statistics response found for team ${teamId}`);
      parsedStats[teamId] = createEmptyStats();
      return;
    }
    
    const categories = teamResponse?.splits?.categories || [];
    const teamStats = createEmptyStats();
    
    // Iterate through all categories to find the stats we need
    categories.forEach(category => {
      const categoryName = category.name;
      
      if (category.stats && Array.isArray(category.stats)) {
        category.stats.forEach(stat => {
          const statName = stat.name;
          
          // Check if this stat is in our list of stats to extract
          if (statsToExtract.defensive?.includes(statName) ||
              statsToExtract.defensiveInterceptions?.includes(statName) ||
              statsToExtract.kicking?.includes(statName) ||
              statsToExtract.general?.includes(statName)) {
            teamStats[statName] = stat.value || 0;
          }
        });
      }
    });
    
    parsedStats[teamId] = teamStats;
  });
  
  return parsedStats;
}

/**
 * Create an empty stats object with all required fields set to 0
 * @returns {Object} Empty stats object
 */
function createEmptyStats() {
  return {
    defensiveTouchdowns: 0,
    kicksBlocked: 0,
    twoPtReturns: 0,
    sacks: 0,
    safeties: 0,
    pointsAllowed: 0,
    interceptions: 0,
    fumblesLost: 0,
    extraPointsMade: 0,
    fieldGoalsMade1_19: 0,
    fieldGoalsMade20_29: 0,
    fieldGoalsMade30_39: 0,
    fieldGoalsMade40_49: 0,
    fieldGoalsMade50: 0
  };
}