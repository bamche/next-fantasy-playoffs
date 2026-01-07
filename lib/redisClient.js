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

export default redisClient;
