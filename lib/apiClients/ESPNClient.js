import axios from 'axios';
import { createRequire } from 'module';
import BaseSportsApiClient from './BaseSportsApiClient';

// Use createRequire to import CommonJS module
const require = createRequire(import.meta.url);
const db = require('../pgClient');

/**
 * ESPN API client implementation
 * ESPN API documentation: http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams
 */
export default class ESPNClient extends BaseSportsApiClient {
  constructor() {
    super();
    this.baseUrl = 'http://site.api.espn.com/apis/site/v2/sports/football/nfl';
    this.coreApiBaseUrl = 'http://sports.core.api.espn.com/v2/sports/football/leagues/nfl';
  }

  /**
   * Initialize the client with API credentials
   * ESPN API doesn't require authentication for public endpoints, but kept for consistency
   * @param {Object} credentials - Authentication credentials (optional for ESPN)
   */
  initialize(credentials = {}) {
    // ESPN public API doesn't require auth, but we can store credentials if needed later
    this.credentials = credentials;
  }

  /**
   * Get all NFL teams from ESPN API
   * @returns {Promise<Object>} Teams data
   */
  async getNflTeams() {
    const url = `${this.baseUrl}/teams`;
    
    try {
      const response = await axios.get(url);
      const teams = response.data.sports[0].leagues[0].teams;
      
      // Log team information as requested
      teams.forEach(({ team }) => {
        console.log({
          id: team.id,
          abbreviation: team.abbreviation,
          name: team.name,
          isActive: team.isActive,
          slug: team.slug,
          color: team.color,
          alternateColor: team.alternateColor
        });
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching NFL teams from ESPN:', error);
      throw error;
    }
  }

  /**
   * Get player list data (to be implemented)
   * @param {Object} options - Options for fetching players
   * @returns {Promise<Object>} Player list data
   */
  async getPlayerList({ season, teams, positions }) {
    throw new Error('getPlayerList not yet implemented for ESPN client');
  }

  /**
   * Fetch game event data from ESPN API
   * @private
   * @param {string} gameId - Game identifier
   * @returns {Promise<Object>} Game event data
   */
  async getGameEvent(gameId) {
    const url = `${this.coreApiBaseUrl}/events/${gameId}?lang=en&region=us`;
    
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching game event ${gameId}:`, error);
      throw new Error(`Failed to fetch game event: ${error.message}`);
    }
  }

  async getTeamStatistics(gameId, teamId) {
    const url = `${this.coreApiBaseUrl}/events/${gameId}/competitions/${gameId}/competitors/${teamId}/statistics/0?lang=en&region=us`;
    
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team statistics for team ${teamId}:`, error);
      throw new Error(`Failed to fetch team statistics: ${error.message}`);
    } 
  }
  
  /**
   * Fetch statistics for all players in the game
   * @private
   * @param {string} gameId - Game identifier
   * @param {Object} teamPlayerIds - Object mapping team ID to array of player IDs
   * @returns {Promise<Object>} Object mapping player ID to their statistics
   */
  async getPlayerStatistics(gameId, teamPlayerIds) {
    const playerStats = {};
    const requests = [];

    // Create all API requests
    for (const [teamId, playerIds] of Object.entries(teamPlayerIds)) {
      for (const playerId of playerIds) {
        requests.push(
          this._getSinglePlayerStats(gameId, teamId, playerId)
            .then(stats => {
              playerStats[playerId] = stats;
            })
            .catch(error => {
              // Skip player if 404, otherwise log error
              if (error.response?.status === 404 || error.is404) {
                console.log(`Skipping player ${playerId} (team ${teamId}) - 404 not found`);
                // Don't add anything to playerStats for 404s
              } else {
                console.error(`Error fetching stats for player ${playerId} (team ${teamId}):`, error);
                playerStats[playerId] = { error: error.message };
              }
            })
        );
      }
    }

    // Execute all requests (consider rate limiting in production)
    await Promise.all(requests);
    
    return playerStats;
  }

  /**
   * Fetch statistics for a single player
   * @private
   * @param {string} gameId - Game identifier
   * @param {string} teamId - NFL team ID
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} Extracted player statistics data
   */
  async _getSinglePlayerStats(gameId, teamId, playerId) {
    const url = `${this.coreApiBaseUrl}/events/${gameId}/competitions/${gameId}/competitors/${teamId}/roster/${playerId}/statistics/0?lang=en&region=us`;
    
    try {
      const response = await axios.get(url);
      const extractedStats = this._extractPlayerStats(response.data);
      
      // Log the extracted stats as requested
      console.log(`Player ${playerId} (Team ${teamId}) stats:`, extractedStats);
      
      return extractedStats;
    } catch (error) {
      // Handle 404s - throw error with flag so caller can skip the player
      if (error.response?.status === 404) {
        console.log(`404 - Player stats not found: playerId=${playerId}, teamId=${teamId}, gameId=${gameId}`);
        const notFoundError = new Error(`Player statistics not found (404)`);
        notFoundError.is404 = true;
        notFoundError.response = error.response;
        throw notFoundError;
      }
      console.error(`Error fetching player stats for player ${playerId}:`, error);
      throw new Error(`Failed to fetch player statistics: ${error.message}`);
    }
  }

  /**
   * Extract specific player statistics from ESPN API response
   * @private
   * @param {Object} responseData - Full response data from ESPN API
   * @returns {Object} Object containing only the specified stats
   */
  _extractPlayerStats(responseData) {
    const statsToExtract = [
      'interceptions',
      'passingTouchdowns',
      'passingYards',
      'twoPtPass',
      'rushingTouchdowns',
      'rushingYards',
      'twoPtRush',
      'receivingTouchdowns',
      'receivingYards',
      'receptions',
      'twoPtReception'
    ];

    const categoriesToSkip = [
      'defensiveInterceptions',
      'defensive'
    ]

    const extractedStats = {};
    const categories = responseData?.splits?.categories || [];

    // Iterate through all categories to find the stats we need
    categories.forEach(category => {
      if (category.stats && Array.isArray(category.stats) && !categoriesToSkip.includes(category.name)) {
        category.stats.forEach(stat => {
          if (statsToExtract.includes(stat.name)) {
            extractedStats[stat.name] = stat.value || 0;
          }
        });
      }
    });

    // Ensure all stats are present (set to 0 if not found)
    statsToExtract.forEach(statName => {
      if (!(statName in extractedStats)) {
        extractedStats[statName] = 0;
      }
    });

    return extractedStats;
  }
}


