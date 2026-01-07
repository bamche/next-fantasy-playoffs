import db from '../lib/pgClient'
import ProcessRemainingView from './ProcessRemainingView';

export default async function GetRemainingView() {
  
  try{
    //retrieve emails of all players in league
    const emailQueryString = `SELECT email FROM public.user_list;`
    const emailList = (await db.query(emailQueryString)).rows;
    
    const leagueStats = {};
      
    for(const email of emailList) {
  
    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT (qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst) FROM public.user_list WHERE email='${email.email}';`;
    const SQLplayerIDList = await db.query(playerListQueryString);
    
    const rawPlayerIDList = SQLplayerIDList.rows[0].row;
    const playerIDList = rawPlayerIDList.replace('(' , '').replace(')', '').split(',');
  
    const playerStats = []
    const statsQueryString = `SELECT player_name FROM public.player_list WHERE player_id IN ${rawPlayerIDList} AND eliminated=false;`
    const individualTeamStats =  (await db.query(statsQueryString)).rows;

    //reorder results
    // playerIDList.forEach( id => {
    //   for(const element of individualTeamStats){
    //     if(element.player_id == id) playerStats.push(element);
    //   };
    // });

    //write each team's player stats to offensive stats object
    leagueStats[email.email] = [];
    individualTeamStats.forEach(player => {
      leagueStats[email.email].push(player.player_name)
    });
    // leagueStats[email.email] = individualTeamStats;
    // console.log(leagueStats);
    //pull defense stats
    const defQueryString = `SELECT nfl_team FROM public.def_list WHERE def_id= ${playerIDList[playerIDList.length-1]}; `
    const defStats =  (await db.query(defQueryString)).rows[0];
    leagueStats[email.email].push(defStats.nfl_team)
    };

    const columns = GenerateColumns(leagueStats);
    return {remainingPlayers: leagueStats, columns};

  } catch(e) {
    console.log(`league-view api error (fetching all team scoring/player data):  ${e}`);
    
  }

}

function GenerateColumns(leagueStats) {
  // Find max number of players for a team to handle variable number of remaining players
  let maxLength = 0;
  for (const [key, value] of Object.entries(leagueStats)) {
    maxLength = Math.max(maxLength, value.length);
  }
  const columnHeader =   {
    field: 'player',
    headerName: 'player',
    width: 120,
  }
  const columns = new Array(maxLength).fill(null).map(() => ({ ...columnHeader }));
  columns[0]['headerName'] = 'email';
  columns[0]['field'] = 'email';
  console.log(columns)
  return columns;
}
