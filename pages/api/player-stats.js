import db from '../../lib/pgClient';
import ProcessTeamView from '../../utils/ProcessTeamView';
import redisClient from '../../lib/redisClient';
import processGamesAutomatically from '../../utils/processGamesAutomatically';

export default async function playerStats(req, res) {
  const { email } = req.query;
  // redisClient.flushDb();
  await processGamesAutomatically();

  const cache = await redisClient.get(`team-view-${email}`);
  if (cache) {
    const teamViewStats = JSON.parse(cache);
    return res.status(200).send({ teamViewStats })   
  } 

  console.log('cache miss');  
  try{
    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT (qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst) FROM public.user_list WHERE email= '${email}';`;
    const SQLplayerIDList = await db.query(playerListQueryString);
    if (!SQLplayerIDList.rows[0]) {
      console.log('No players returned')
      return res.status(200).send([])
    }
    const rawPlayerIDList = SQLplayerIDList.rows[0].row;
    const playerIDList = rawPlayerIDList.replace('(' , '').replace(')', '').split(',');

    const playerStats = []
    
    const statsQueryString = `SELECT *, nfl.abbreviation as abbreviation FROM public.player_list join all_nfl_teams nfl on player_list.nfl_team = nfl.id WHERE player_id IN ${rawPlayerIDList}; `
    const individualTeamStats =  (await db.query(statsQueryString)).rows;
    
    //reorder results
    playerIDList.forEach( id => {
      for(const element of individualTeamStats){
        if(element.player_id == id) playerStats.push(element);
      };
    });

    //pull defense stats
    const defQueryString = `SELECT * FROM public.def_list WHERE def_id= ${playerIDList[playerIDList.length-1]}; `
    const defStats =  (await db.query(defQueryString)).rows[0];
    const teamViewStats = ProcessTeamView(playerStats, defStats);
    redisClient.set(`team-view-${email}`, JSON.stringify(teamViewStats));
    res.status(200).send({ teamViewStats })

  } catch(e) {
    console.log(`player-stats api error (fetching all players):  ${e}`);
    res.status(500).send(e);
  }
}