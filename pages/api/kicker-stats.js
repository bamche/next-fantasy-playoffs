import db from '../../lib/pgClient'

//to get the stats of all players that are on at least one team
export default async function detailedPlayerStats(req, res) {
  try{

    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT k FROM public.user_list;`;
    const SQLplayerIDList = await db.query(playerListQueryString);
    
    let idString = ''
    
    //process each row to make a list of players to check against
    SQLplayerIDList.rows.forEach( row => idString += `${row.k}, ` )
    const rawPlayerIDList = idString.slice(0, -2)
    const statsQueryString = `SELECT *, nfl.abbreviation as abbreviation FROM public.player_list join all_nfl_teams nfl on player_list.nfl_team = nfl.id WHERE player_id IN (${rawPlayerIDList}); `
    const kickerStats =  (await db.query(statsQueryString)).rows;
        
    res.status(200).send({ kickerStats })

  } catch(e) {
    console.log(`kicker-stats api error (fetching kicker stats):  ${e}`);
    res.status(500).send(e);
  }
  
}