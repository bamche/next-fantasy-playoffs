import db from '../../lib/playerDataModels'

export default async function teamBuilder(req, res) {

  if (req.method === 'POST') {

    try{
      const { 
        email, 
        teamName:team_name, 
        name:user_name, 
        qb, 
        rb1, 
        rb2, 
        wr1, 
        wr2, 
        te, 
        flex1, 
        flex2, 
        flex3, 
        flex4, 
        k, 
        dst
      } = req.query;

      const teamEntry = { user_name, email, team_name,  qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst };
      
      const SQLQueryString = 
      `INSERT INTO "public"."user_list" 
      (user_name, email, team_name, qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst) 
      VALUES ('${user_name}', '${email}', '${team_name}',  '${qb}', '${rb1}', '${rb2}', '${wr1}',
              '${wr2}', '${te}', '${flex1}', '${flex2}', '${flex3}', '${flex4}', '${k}', '${dst}') 
      ON CONFLICT (email) 
      DO UPDATE 
        SET qb = excluded.qb,	
        rb1 = excluded.rb1,		
        rb2 = excluded.rb2,	
        wr1 = excluded.wr1,
        wr2 = excluded.wr2,
        te = excluded.te,	
        flex1 = excluded.flex1,	
        flex2 = excluded.flex2,
        flex3 = excluded.flex3,
        flex4 = excluded.flex4,	
        k = excluded.k,			
        dst = excluded.dst;`
    
    const result = await db.query(SQLQueryString);
      
    res.status(200).json({teamEntry, success: true, result});
    } catch(e){
      console.log(`team-builder api post error:  ${e}`);
      res.status(500).send(e);
    }


  } else {

    try{
          
      const playerQueryString = `SELECT player_id, player_name, position, nfl_team FROM public.player_list`;
      const defQueryString = `SELECT def_id, nfl_team FROM public.def_list`;
      
      const playerList = await db.query(playerQueryString);
      const defList = await db.query(defQueryString);
      
      res.status(200).json({
        playerList:playerList.rows, 
        defList:defList.rows
      })
      
    } catch(e){
        console.log(`team-builder api fetch error:  ${e}`);
        res.status(500).send(e);
    }
  }
}