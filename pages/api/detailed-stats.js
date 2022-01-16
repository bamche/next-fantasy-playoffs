import db from '../../lib/playerDataModels'

//to get the stats of all players that are on at least one team
export default async function detailedPlayerStats(req, res) {
  try{

    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT (qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4) FROM public.user_list;`;
    const SQLplayerIDList = await db.query(playerListQueryString);
    
    let idString = ''
    
    //cache to avoid adding duplicate player ids since there will be repeats from multiple teams
    // const duplicateCache = {};
    // SQLplayerIDList.rows.forEach( row => {
    //   const arrayOfIDs = row.row.replace('(' , '').replace(')', '').split(',')
    //   arrayOfIDs.forEach( id => {
    //     if(duplicateCache[id]) return;
    //     duplicateCache[id] = true;
    //     playerIDList.push(id)
    //   })
    // })

    //process each row to make a list of players to check against
    SQLplayerIDList.rows.forEach( row => idString += row.row )
    console.log(SQLplayerIDList)
    const rawPlayerIDList = idString.replaceAll(')(' , ',')
    const statsQueryString = `SELECT * FROM public.player_list WHERE player_id IN ${rawPlayerIDList}; `
    const offensePlayerStats =  (await db.query(statsQueryString)).rows;
    console.log(offensePlayerStats);
        
    res.status(200).send({ offensePlayerStats })

  } catch(e) {
    console.log(`detailed-stats api error (fetching offensive player detailed stats):  ${e}`);
    res.status(500).send(e);
  }
  
    
}