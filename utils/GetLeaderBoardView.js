import db from '../lib/pgClient';
import { leaderBoardQuery } from '../constants/game/sqlQueries';

export default async function GetLeaderBoardView() {
  try {
    const leaderBoardDataResult = await db.query(leaderBoardQuery);
    const leaderBoardData = leaderBoardDataResult.rows;
    return leaderBoardData;
  } catch (error) {
    console.error('Error fetching leader board data:', error);
    return [];
  }
}