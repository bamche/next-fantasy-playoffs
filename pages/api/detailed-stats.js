import db from '../../lib/pgClient'

//to get the stats of all players that are on at least one team
export default async function detailedPlayerStats(req, res) {
  try{

    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT (qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4) FROM public.user_list;`;
    const SQLplayerIDList = await db.query(playerListQueryString);
    
    let idString = '(';
    
    //process each row to make a list of players to check against
    SQLplayerIDList.rows.forEach( row => idString += `${row.row.replace('(' , '').replace(')', '')}, ` );
    const rawPlayerIDList = (idString.slice(0, -2));
    const statsQueryString = `SELECT *, nfl.abbreviation as abbreviation FROM public.player_list join all_nfl_teams nfl on player_list.nfl_team = nfl.id WHERE player_id IN ${rawPlayerIDList}); `
    const offensePlayerStats =  (await db.query(statsQueryString)).rows;
        
    res.status(200).send({ offensePlayerStats })

  } catch(e) {
    console.log(`detailed-stats api error (fetching offensive player detailed stats):  ${e}`);
    res.status(500).send(e);
  }
  
    
}