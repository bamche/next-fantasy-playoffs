import { createClient } from 'redis';

let redisClient;

if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL_2,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  // Connect to Redis
  redisClient.connect().catch((err) => console.error('Redis connection error:', err));
}

/**
 * Deletes all keys that start with 'team-view-*'
 * @returns {Promise<number>} The number of keys deleted
 */
export async function deleteTeamViewKeys() {
  try {
    let cursor = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: 'team-view-*',
        COUNT: 100
      });
  
      cursor = result.cursor;
      const keys = result.keys;
  
      if (keys.length > 0) {
        console.log(`Deleting ${keys.length} keys:`, keys);
        await redisClient.del(keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error('Error deleting team-view keys:', error);
    throw error;
  }
}

export async function deleteLeagueViewKey() {
  try {
    await redisClient.del('detailed-league-view');
  } catch (error) {
    console.error('Error deleting detailed-league-view key:', error);
    throw error;
  }
}

export default redisClient;
