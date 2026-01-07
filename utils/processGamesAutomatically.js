import { gameConstants } from '../constants/game/gameConstants';
import redisClient from '../lib/redisClient';
import { processGameStats } from '../pages/api/admin/get-game-stats-espn';

/**
 * Helper function that processes games automatically based on time and Redis flags
 * 1. Loops through gameConstants and checks if current time is more than 4 hours after gameTimeStart
 * 2. Checks Redis flags for each gameId (NOT_PROCESSED or PROCESSED)
 * 3. If NOT_PROCESSED: sets flag to PROCESSED, calls processGameStats, reverts flag on failure
 * 4. If PROCESSED: does nothing
 */
export default async function processGamesAutomatically() {
    const currentTime = new Date();
    const eligibleGameIds = [];

    // Step 1: Loop through gameConstants and find games that started more than 4 hours ago
    for (const game of gameConstants) {
        const gameStartTime = new Date(game.gameTimeStart);
        const hoursSinceStart = (currentTime - gameStartTime) / (1000 * 60 * 60); // Convert milliseconds to hours

        if (hoursSinceStart >= 4) {
            eligibleGameIds.push(game.gameId);
        }
    }

    if (eligibleGameIds.length === 0) {
        console.log('No games eligible for processing (4+ hours since start)');
        return;
    }

    console.log(`Found ${eligibleGameIds.length} eligible game(s) for processing:`, eligibleGameIds);

    // Step 2 & 3: Check Redis flags and process games
    for (const gameId of eligibleGameIds) {
        try {
            // Check Redis flag for this gameId
            const flag = await redisClient.get(gameId);
            const status = flag || 'NOT_PROCESSED'; // Default to NOT_PROCESSED if key doesn't exist

            console.log(`Game ${gameId} status: ${status}`);

            if (status === 'PROCESSED') {
                // Step 4: Already processed, do nothing
                console.log(`Game ${gameId} already processed, skipping`);
                continue;
            }

            if (status === 'NOT_PROCESSED') {
                // Step 3: Set flag to PROCESSED
                await redisClient.set(gameId, 'PROCESSED');
                console.log(`Set flag to PROCESSED for game ${gameId}`);

                try {
                    // Call processGameStats
                    await processGameStats(gameId);
                    console.log(`Successfully processed game ${gameId}`);
                } catch (error) {
                    // If processing fails, revert flag to NOT_PROCESSED
                    await redisClient.set(gameId, 'NOT_PROCESSED');
                    console.error(`Failed to process game ${gameId}, reverted flag to NOT_PROCESSED:`, error);
                }
            }
        } catch (error) {
            console.error(`Error processing game ${gameId}:`, error);
        }
    }
}

