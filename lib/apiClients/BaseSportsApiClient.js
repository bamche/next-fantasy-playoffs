/**
 * Base abstract class for Sports API clients
 * This defines the interface that all API client implementations must follow
 */
export default class BaseSportsApiClient {
  /**
   * Get player list data
   * @param {Object} options - Options for fetching players
   * @param {string} options.season - Season identifier
   * @param {string} options.teams - Comma-separated team list
   * @param {string} options.positions - Comma-separated position list
   * @returns {Promise<Object>} Player list data
   */
  async getPlayerList({ season, teams, positions }) {
    throw new Error('getPlayerList must be implemented by subclass');
  }

  /**
   * Get game stats/boxscore data
   * @param {Object} options - Options for fetching game stats
   * @param {string} options.gameId - Game identifier
   * @returns {Promise<Object>} Game stats/boxscore data
   */
  async getGameStats({ gameId }) {
    throw new Error('getGameStats must be implemented by subclass');
  }

  /**
   * Initialize the client with authentication credentials
   * @param {Object} credentials - Authentication credentials
   */
  initialize(credentials) {
    throw new Error('initialize must be implemented by subclass');
  }
}

