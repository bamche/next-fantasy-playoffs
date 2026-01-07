import MySportsFeedsClient from './MySportsFeedsClient';

/**
 * Factory function to create and initialize the sports API client
 * To swap to a new API, replace MySportsFeedsClient with your new client implementation
 * and ensure it extends BaseSportsApiClient
 * 
 * @returns {BaseSportsApiClient} Initialized API client instance
 */
export function createSportsApiClient() {
  const client = new MySportsFeedsClient();
  
  // Initialize with environment variables
  client.initialize({
    apiKey: process.env.API_KEY,
    password: process.env.PASSWORD,
  });
  
  return client;
}

// Export the client classes for direct use if needed
export { MySportsFeedsClient };
export { default as ESPNClient } from './ESPNClient.mjs';
export { default as BaseSportsApiClient } from './BaseSportsApiClient';

