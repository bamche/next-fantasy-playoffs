import db from '../../lib/playerDataModels'

export default async function playerStats(req, res) {
  const { email } = req.query;
  try{
    //intial call to retieve player ID, then put into array for ordering since results return unordered
    const playerListQueryString = `SELECT (qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst) FROM public.user_list WHERE email= '${email}';`;
    const SQLplayerIDList = await db.query(playerListQueryString);
    console.log(SQLplayerIDList)
    const rawPlayerIDList = SQLplayerIDList.rows[0].row;
    const playerIDList = rawPlayerIDList.replace('(' , '').replace(')', '').split(',');

    const playerStats = []
    
    const statsQueryString = `SELECT * FROM public.player_list WHERE player_id IN ${rawPlayerIDList}; `
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
        
    res.status(200).send({ playerStats, defStats })

  } catch(e) {
    console.log(`player-stats api error (fetching all players):  ${e}`);
    res.status(500).send(e);
  }
  
    
}