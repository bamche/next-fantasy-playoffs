import db from '../../lib/pgClient'
import { leaderBoardQuery } from '../../constants/game/sqlQueries';

export default async function leaderBoard (req, res) {
  try{
    const leaderBoardDataResult = await db.query(leaderBoardQuery);
    const leaderBoardData = leaderBoardDataResult.rows;
    console.log(leaderBoardData)
  
    res.status(200).send({ leaderBoardData })
  
  } catch(e) {
    console.log(`leader-board api error (fetching leader board data):  ${e}`);
    res.status(500).send(e);
  }

}
