import db from '../../lib/pgClient'
import redisClient from '../../lib/redisClient';

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
    await redisClient.del(`team-view-${email}`);
      
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

      // Fetch user's existing team selection if email is provided
      let userTeam = null;
      const { email } = req.query;
      if (email) {
        const userTeamQueryString = 
          `SELECT qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst 
           FROM public.user_list WHERE email = '${email}'`;
        const userTeamResult = await db.query(userTeamQueryString);
        if (userTeamResult.rows.length > 0) {
          const userTeamRow = userTeamResult.rows[0];
          
          // Collect all player IDs (excluding nulls)
          const playerIds = [
            userTeamRow.qb, userTeamRow.rb1, userTeamRow.rb2, 
            userTeamRow.wr1, userTeamRow.wr2, userTeamRow.te,
            userTeamRow.flex1, userTeamRow.flex2, userTeamRow.flex3, userTeamRow.flex4,
            userTeamRow.k
          ]
          
          if (playerIds.some(id => id === null || id === undefined || id === '') || playerIds.length === 0) {
            return res.status(200).json({
              playerList:playerList.rows, 
              defList:defList.rows,
              userTeam: null
            });
          }
          const defId = userTeamRow.dst;
          
          // Fetch all players at once
          let playersMap = {};

          const playerIdsString = playerIds.join(',');
          const playersQueryString = 
            `SELECT player_id, player_name, position, nfl.abbreviation as nfl_team, nfl.color, nfl.alternate_color 
              FROM public.player_list 
              JOIN all_nfl_teams nfl ON player_list.nfl_team = nfl.id 
              WHERE player_id IN (${playerIdsString})`;
          const playersResult = await db.query(playersQueryString);
          playersResult.rows.forEach(player => {
            playersMap[player.player_id] = player;
          });
          
          // Fetch defense if exists
          let defMap = {};
          const defQueryString = 
            `SELECT def_id, def_list.nfl_team, nfl.color, nfl.alternate_color 
            FROM public.def_list 
            JOIN all_nfl_teams nfl ON def_list.def_id = nfl.id 
            WHERE def_id = ${defId}`;
          const defResult = await db.query(defQueryString);
          if (defResult.rows.length > 0) {
            defMap[defId] = defResult.rows[0];
          }
          
          // Helper function to build player entry
          const buildPlayerEntry = (playerId, position) => {

            // Check if it's a DST (defense)
            if (position === 'DST') {
              const def = defMap[playerId];
              if (def) {
                return [def.def_id, `${def.nfl_team} -- DST`, def.color, def.alternate_color];
              }
            } else {
              // Regular player
              const player = playersMap[playerId];
              if (player) {
                return [player.player_id, `${player.nfl_team}, ${player.player_name}, ${player.position}`, player.color, player.alternate_color];
              }
            }
            return [null, position, null, null];
          };

          // Build fully-formed team selection object
          userTeam = {
            qb: buildPlayerEntry(userTeamRow.qb, 'QB'),
            rb1: buildPlayerEntry(userTeamRow.rb1, 'RB'),
            rb2: buildPlayerEntry(userTeamRow.rb2, 'RB'),
            wr1: buildPlayerEntry(userTeamRow.wr1, 'WR'),
            wr2: buildPlayerEntry(userTeamRow.wr2, 'WR'),
            te: buildPlayerEntry(userTeamRow.te, 'TE'),
            flex1: buildPlayerEntry(userTeamRow.flex1, 'FLEX'),
            flex2: buildPlayerEntry(userTeamRow.flex2, 'FLEX'),
            flex3: buildPlayerEntry(userTeamRow.flex3, 'FLEX'),
            flex4: buildPlayerEntry(userTeamRow.flex4, 'FLEX'),
            k: buildPlayerEntry(userTeamRow.k, 'K'),
            dst: buildPlayerEntry(userTeamRow.dst, 'DST')
          };
        }
      }

      res.status(200).json({
        playerList:playerList.rows, 
        defList:defList.rows,
        userTeam: userTeam
      })
      
    } catch(e){
        console.log(`team-builder api fetch error:  ${e}`);
        res.status(500).send(e);
    }
  }
}