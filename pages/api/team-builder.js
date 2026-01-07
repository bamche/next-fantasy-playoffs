import db from '../../lib/pgClient'

export default async function teamBuilder(req, res) {
  if (req.method === 'POST') {

    try{
      const { 
        email,  
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
      } = req.body;

      const teamEntry = { email, qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst };
      
      const SQLQueryString = 
      `INSERT INTO "public"."user_list" 
      (email, qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst) 
      VALUES ('${email}', '${qb}', '${rb1}', '${rb2}', '${wr1}',
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
          
      const playerQueryString = 
        `SELECT player_id, player_name, position, nfl.abbreviation as nfl_team, nfl.color, nfl.alternate_color 
        FROM public.player_list JOIN all_nfl_teams nfl ON player_list.nfl_team = nfl.id`;
      const defQueryString = `SELECT def_id, def_list.nfl_team, nfl.color, nfl.alternate_color FROM public.def_list JOIN all_nfl_teams nfl ON def_list.def_id = nfl.id`;
      
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