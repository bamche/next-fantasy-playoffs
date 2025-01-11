import db from '../../lib/playerDataModels'
import ProcessLeagueView from '../../utils/ProcessLeagueView';

export default async function leagueView (req, res) {

  try{
    //retrieve emails of all players in league
const emailQueryString = `SELECT email FROM public.user_list;`
    const emailList = (await db.query(emailQueryString)).rows;
    
    const leagueStats = {};
      
    for(const email of emailList) {
  
    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT (qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst) FROM public.user_list WHERE email= '${email.email}';`;
    const SQLplayerIDList = await db.query(playerListQueryString);
    
    const rawPlayerIDList = SQLplayerIDList.rows[0].row;
    const playerIDList = rawPlayerIDList.replace('(' , '').replace(')', '').split(',');
  
    const playerStats = []
    const statsQueryString = `SELECT player_id, player_name, position, nfl_team, points1, points2, points3, points4 FROM public.player_list WHERE player_id IN ${rawPlayerIDList}; `
    const individualTeamStats =  (await db.query(statsQueryString)).rows;

    //reorder results
    playerIDList.forEach( id => {
      for(const element of individualTeamStats){
        if(element.player_id == id) playerStats.push(element);
      };
    });

    //write each team's player stats to offensive stats object
    leagueStats[email.email] = {};
    leagueStats[email.email]['offense'] = playerStats;
    
    //pull defense stats
    const defQueryString = `SELECT * FROM public.def_list WHERE def_id= ${playerIDList[playerIDList.length-1]}; `
    const defStats =  (await db.query(defQueryString)).rows[0];
    leagueStats[email.email]['defense'] = defStats
    };
    
    const processedLeagueStats = ProcessLeagueView(leagueStats);
  
    res.status(200).send({ processedLeagueStats })
  
  } catch(e) {
    console.log(`league-view api error (fetching all team scoring/player data):  ${e}`);
    res.status(500).send(e);
  }

}
