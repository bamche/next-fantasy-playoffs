const axios = require('axios');
const format = require('pg-format');
import db from '../../../lib/playerDataModels';

export default async function getGameStats(req, res) {
    const week = req.query.week;    
    if (req.key !== process.env.API_KEY) {
        throw new Error("Unauthorized");
    }
    const token = Buffer.from(`${process.env.API_KEY}:${process.env.PASSWORD}`, 'utf8').toString('base64');
    const headers = {
        'Authorization': `Basic ${token}`
    }
    const url = process.env.GAME_URL + `${req.query.gameID}/boxscore.json`;
    const parameters ={
        url,
        method: 'get',
        headers
    };

    try{
        if (week != '1' && week != '2' && week != '3' && week != '4') {
            throw new Error("Incorrect week format");
        } 
        const gameStatsData = await axios(parameters);
        
        const defenseStats = processDefenseStats(gameStatsData.data, week);
        const playerStats = processPlayerStats(gameStatsData.data, week);
    
        const playerStatsLog = updateDBPlayerStats(week, playerStats);
        const defenseStatsLog = updatDBDefenseStats(week, defenseStats);

        res.status(200).send({ playerStatsLog, defenseStatsLog });
    } catch(e){
        console.log(`get-game-stats api error:  ${e}`);
        res.status(500).send(e);
    };
    
};

function processDefenseStats(data, week) {
    const superBowlFactor =  week === 4 ? 1.5 : 1;    
    const awayStats = [data.game.awayTeam.id];
    const homeStats = [data.game.homeTeam.id];

    const away = data.stats.away.teamStats[0];
    const home = data.stats.home.teamStats[0];

    awayStats.push(...sortDefense(away, superBowlFactor));
    homeStats.push(...sortDefense(home, superBowlFactor));
    //results are returned like this since every game has an away and home team, and stats are updated per game
    return [awayStats, homeStats];
}

function processPlayerStats(data, week) {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K'];
    const playerData = data.stats.away.players.concat(data.stats.home.players);           
    const sortedPlayerStats = [];
    const superBowlFactor =  week === 4 ? 1.5 : 1;
    playerData.forEach(el =>{
        const position = el.player.position;
        const current = el.playerStats[0];

        if(positions.includes(position)){
            
            const player_id = el.player.id;
            const pass_yd = (position === "K" ? 0 : current.passing.passYards);
            const pass_td = (position === "K" ? 0 : current.passing.passTD);
            const interception = (position === "K" ? 0 : current.passing.passInt);
            const rush_yd = (position === "K" ? 0 : current.rushing.rushYards);
            const rush_td = (position === "K" ? 0 : current.rushing.rushTD);
            const rec_yd = (position === "K" ? 0 : current.receiving.recYards);
            const rec_td = (position === "K" ? 0 : current.receiving.recTD);
            const rec = ((position === "K" || position === "TE") ? 0 : current.receiving.receptions);
            const te_rec = (position === "TE" ? current.receiving.receptions : 0);
            const two_pt = (position === "K" ? 0 : current.twoPointAttempts.twoPtMade);
            const fg30 = (position === "K" ? current.fieldGoals.fgMade1_19 + current.fieldGoals.fgMade20_29 + current.fieldGoals.fgMade30_39 : 0);
            const fg40 = (position === "K" ? current.fieldGoals.fgMade40_49 : 0);
            const fg50 = (position === "K" ? current.fieldGoals.fgMade50Plus : 0);
            const xtpm = (position === "K" ? current.extraPointAttempts.xpMade : 0);
            const points = ( 
                pass_yd * 0.025 + pass_td * 4 + interception * -2 + rush_yd * 0.1 + rush_td * 6 + rec_yd * 0.1 + 
                rec_td * 6 + rec * 1 + te_rec * 1.5 + two_pt * 2 + fg30 * 3 + fg40 * 4 + fg50 * 5 + xtpm * 1
                ) * superBowlFactor;

            sortedPlayerStats.push(
                [player_id, pass_yd, pass_td, interception, rush_yd, rush_td, 
                rec_yd, rec_td, rec, te_rec, two_pt, fg30, fg40, fg50, xtpm, points]
                );
        }
    })
    
    return sortedPlayerStats;
}

async function updateDBPlayerStats(week, playerStats) {
    try{        
        const SQLQueryString = `INSERT INTO public.player_list 
        (player_id, pass_yd${week}, pass_td${week}, interception${week}, rush_yd${week}, rush_td${week}, 
        rec_yd${week}, rec_td${week}, rec${week}, te_rec${week}, two_pt${week}, fg30${week}, fg40${week}, fg50${week}, xtpm${week}, points${week}) 
        VALUES %L 
        ON CONFLICT (player_id) 
        DO UPDATE 
          SET pass_yd${week} = excluded.pass_yd${week}, 
              pass_td${week} = excluded.pass_td${week}, 
              interception${week} = excluded.interception${week},
              rush_yd${week} = excluded.rush_yd${week}, 
              rush_td${week} = excluded.rush_td${week}, 
              rec_yd${week} = excluded.rec_yd${week}, 
              rec_td${week} = excluded.rec_td${week}, 
              rec${week} = excluded.rec${week}, 
              te_rec${week} = excluded.te_rec${week}, 
              two_pt${week} = excluded.two_pt${week}, 
              fg30${week} = excluded.fg30${week}, 
              fg40${week} = excluded.fg40${week}, 
              fg50${week} = excluded.fg50${week}, 
              xtpm${week} = excluded.xtpm${week},
              points${week} = excluded.points${week};` 

        const formatString = format(SQLQueryString, playerStats);
      
        console.log(formatString)
        await db.query(formatString);
        return "SQL operation complete: " + formatString;
    } catch(e) {
        console.log(`get-game-stats api error (updateDBPlayerStats):  ${e}`);
    }
};

async function updatDBDefenseStats(week, defenseStats) {
    try{
        const SQLQueryString = `INSERT INTO public.def_list 
          (def_id, sack${week},	turnover${week}, block_ret${week}, sfty${week},	td${week}, pts_allowed${week}, points${week}) 
          VALUES %L 
          ON CONFLICT (def_id) 
          DO UPDATE 
            SET sack${week} = excluded.sack${week},	
            turnover${week} = excluded.turnover${week},	
            block_ret${week} = excluded.block_ret${week},	
            sfty${week} = excluded.sfty${week},	
            td${week} = excluded.td${week},	
            pts_allowed${week} = excluded.pts_allowed${week},
            points${week} = excluded.points${week};` 
  
        const formatString = format(SQLQueryString, defenseStats);
        await db.query(formatString);
        return "SQL operation complete: " + formatString;
    } catch(e) {
        console.log(`get-game-stats api error (updatDBDefenseStats):  ${e}`);
    }
  };

function calculatePointsAllowedScore (pointsAllowed) {
    if(pointsAllowed === null){
        return 0;
    } else if(pointsAllowed === 0 ){
        return 12;
    } else if(pointsAllowed < 7){
        return 8;
    } else if(pointsAllowed < 11){
        return 5;
    } else if( pointsAllowed < 18) {
        return 2;
    } else {
        return 0;
    }
}

function sortDefense(team, superBowlFactor) {
    const sacks = team.tackles.sacks;
    const turnovers = team.interceptions.interceptions + team.fumbles.fumForced;
    const blocks = team.interceptions.kB;
    const safeties = team.interceptions.safeties;
    const touchdowns = team.interceptions.intTD + team.fumbles.fumTD + team.kickoffReturns.krTD + 
                        team.puntReturns.prTD + team.kickoffs.koTD; 
    const pointsAllowed = team.standings.pointsAgainst;
    const points = (sacks * 1 + turnovers * 2 + blocks * 2 + safeties * 5 + touchdowns * 6 + calculatePointsAllowedScore(pointsAllowed)) * superBowlFactor;

    return [sacks, turnovers, blocks, safeties, touchdowns, pointsAllowed, points];

}