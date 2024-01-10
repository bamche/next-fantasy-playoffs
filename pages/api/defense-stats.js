import db from '../../lib/playerDataModels'
import ProcessDefenseStats from '../../utils/ProcessDefenseStats';

//to get the stats of all players that are on at least one team
export default async function detailedPlayerStats(req, res) {
  try{

    const playerListQueryString = `SELECT * FROM public.def_list;`;
    const rawStats = await db.query(playerListQueryString);
    const defenseStats = ProcessDefenseStats(rawStats.rows);
    console.log(defenseStats)
    res.status(200).send({ defenseStats : defenseStats})

  } catch(e) {
    console.log(`defense-stats api error (fetching defensive stats):  ${e}`);
    res.status(500).send(e);
  }
  
}