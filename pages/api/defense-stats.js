import db from '../../lib/playerDataModels'

//to get the stats of all players that are on at least one team
export default async function detailedPlayerStats(req, res) {
  try{

    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT * FROM public.def_list;`;
    // const SQLplayerIDList = await db.query(playerListQueryString);
    const defenseStats = await db.query(playerListQueryString);
    // let idString = ''
    // console.log(SQLplayerIDList)
    //process each row to make a list of players to check against
    // SQLplayerIDList.rows.forEach( row => idString += `${row.def_id}, ` )
    // const rawPlayerIDList = idString.slice(0, -2)
    // const statsQueryString = `SELECT * FROM public.player_list WHERE player_id IN (${rawPlayerIDList}); `
    // const defenseStats =  (await db.query(statsQueryString)).rows;
    //     console.log(defenseStats)
    console.log(defenseStats.rows)
    res.status(200).send({ defenseStats : defenseStats.rows })

  } catch(e) {
    console.log(`defense-stats api error (fetching defensive stats):  ${e}`);
    res.status(500).send(e);
  }
  
}