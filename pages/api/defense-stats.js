import db from '../../lib/playerDataModels'

//to get the stats of all players that are on at least one team
export default async function detailedPlayerStats(req, res) {
  try{

    const playerListQueryString = `SELECT * FROM public.def_list;`;
    const defenseStats = await db.query(playerListQueryString);
 
    res.status(200).send({ defenseStats : defenseStats.rows })

  } catch(e) {
    console.log(`defense-stats api error (fetching defensive stats):  ${e}`);
    res.status(500).send(e);
  }
  
}