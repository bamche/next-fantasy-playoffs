import db from '../lib/pgClient';
import { teamViewQuery } from '../constants/game/sqlQueries';

export default async function GetTeamView(email) {
  try {
    const teamViewDataResult = await db.query(teamViewQuery, [email]);
    const teamViewData = teamViewDataResult.rows;
    return teamViewData;
  } catch (error) {
    console.error('Error fetching team view data:', error);
    return [];
  }
}