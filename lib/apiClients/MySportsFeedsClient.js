const axios = require('axios');
import BaseSportsApiClient from './BaseSportsApiClient';
import { GAME_URL, PLAYERS_URL } from '../../utils/constants';

/**
 * MySportsFeeds API client implementation
 * This is the current API implementation that can be swapped out
 */
export default class MySportsFeedsClient extends BaseSportsApiClient {
  constructor() {
    super();
    this.apiKey = null;
    this.password = null;
    this.baseHeaders = null;
  }

  /**
   * Initialize the client with API credentials
   * @param {Object} credentials - Authentication credentials
   * @param {string} credentials.apiKey - API key
   * @param {string} credentials.password - API password
   */
  initialize({ apiKey, password }) {
    this.apiKey = apiKey;
    this.password = password;
    const token = Buffer.from(`${apiKey}:${password}`, 'utf8').toString('base64');
    this.baseHeaders = {
      'Authorization': `Basic ${token}`
    };
  }

  /**
   * Get player list from MySportsFeeds API
   * @param {Object} options - Options for fetching players
   * @param {string} options.season - Season identifier
   * @param {string} options.teams - Comma-separated team list
   * @param {string} options.positions - Comma-separated position list
   * @returns {Promise<Object>} Player list data with players array
   */
  async getPlayerList({ season, teams, positions }) {
    if (!this.apiKey || !this.password) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    const url = `${PLAYERS_URL}?season=${season}&team=${teams}&position=${positions}`;
    const parameters = {
      url,
      method: 'get',
      headers: this.baseHeaders,
    };

    const response = await axios(parameters);
    return response.data;
  }

  /**
   * Get game stats/boxscore from MySportsFeeds API
   * @param {Object} options - Options for fetching game stats
   * @param {string} options.gameId - Game identifier
   * @returns {Promise<Object>} Game stats/boxscore data
   */
  async getGameStats({ gameId }) {
    if (!this.apiKey || !this.password) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    const url = `${GAME_URL}${gameId}/boxscore.json`;
    const parameters = {
      url,
      method: 'get',
      headers: this.baseHeaders,
    };

    const response = await axios(parameters);
    return response.data;
  }
}

