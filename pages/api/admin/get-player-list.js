const axios = require('axios');
const format = require('pg-format');
import db from '../../../lib/playerDataModels'
import { SEASON_ID, TEAM_LIST, PLAYERS_URL } from '../../../utils/constants';

export default async function getPlayerList(req, res) {
    const token = Buffer.from(`${process.env.API_KEY}:${process.env.PASSWORD}`, 'utf8').toString('base64');

    const headers = {
        'Authorization': `Basic ${token}`
    };
    const position = 'qb,rb,wr,te,k';

    const url = PLAYERS_URL + `?season=${SEASON_ID}&team=${TEAM_LIST}&position=${position}`;

    const parameters = {
        url,
        method: 'get',
        headers,
    };

    try{
        console.log(parameters)
        const playerList = await axios(parameters);
        const [playerData, teamData] = addPlayers(playerList.data.players);

        const playerListString = await generatePlayerList(playerData);
        const defenseListString = await generateDefenseList(teamData);
        res.status(200).send({ playerListString, defenseListString })
    } catch(e) {
      console.log(`get-player-lists api error:  ${e}`);
      res.status(500).send(e);
    }
}

const addPlayers = (data) => {
    const sortedData = [];
    const teamData = [];
    const teamIDs = [];
    data.forEach(element => {
        const team = element['player']['currentTeam'] === null ? 'NULL' : element['player']['currentTeam']['abbreviation'];
        const teamID = element['player']['currentTeam'] === null ? 'NULL' : element['player']['currentTeam']['id'];

        sortedData.push([element['player']['id'], 
                        element['player']['firstName']+' '+element['player']['lastName'],
                        element['player']['primaryPosition'],
                        team]);
        if(!teamIDs.includes(teamID)){
            teamIDs.push(teamID);
            teamData.push([teamID,team]);
        }

    });
    console.log(sortedData);
    return [sortedData, teamData];
}

const generatePlayerList = async (playerData) => {
    try{        
        const SQLQueryString = `INSERT INTO public.player_list (player_id, player_name, position, nfl_team) VALUES %L returning player_id`;
        let formatString = format(SQLQueryString, playerData);
        console.log(formatString);        
        await db.query(formatString);
        return "SQL operation complete: " + formatString;
    } catch(err){
        console.log(`Error occured adding players in generatePlayerlist: ${err}`)
    };
};

const generateDefenseList = async (teamData) => {
    try{
        const SQLQueryString = `INSERT INTO public.def_list (def_id, nfl_team) VALUES %L returning def_id`;
        let formatString = format(SQLQueryString, teamData);
        console.log(formatString);
        await db.query(formatString);
        return "SQL operation complete: " + formatString;
    } catch(err) {
        console.log(`Error occured adding players in generatePlayerlist: ${err}`);
    }
};