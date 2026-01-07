import db from '../lib/pgClient'
import GetRemainingColumns from './GetRemainingColumns';
import { remainingDefQuery, remainingPlayerQuery } from './constants';

export default async function GetRemainingPlayersView() {

  try {
    const remiainingDef = (await db.query(remainingDefQuery)).rows;
    const remaingPlayerList = (await db.query(remainingPlayerQuery)).rows;
    let maxLength = 0;
    let id = 0;
    for (const defense of remiainingDef) {
      const playerList = remaingPlayerList.find( ele => ele.email == defense.email);
      playerList.player_names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));;
      playerList.player_names.push(defense.nfl_team);
    }
    for (const playerList of remaingPlayerList) {
      maxLength = Math.max(maxLength, playerList.player_names.length);
    }

    for (const playerList of remaingPlayerList) {
      for (let i = 0; i < maxLength; i++) {
        playerList['player' + i] = i == playerList.player_names.length ? '' : playerList.player_names[i];
      }
      playerList.id = id;
      id++;
      delete playerList.player_names;
      console.log(typeof playerList.total1 )
      playerList.total1 =  playerList.total1 ? Number(parseFloat(playerList.total1).toFixed(2)) : 0
      playerList.total2 =  playerList.total2 ? Number(parseFloat(playerList.total2).toFixed(2)) : 0
      playerList.total3 =  playerList.total3 ? Number(parseFloat(playerList.total3).toFixed(2)) : 0
      playerList.total4 =  playerList.total4 ? Number(parseFloat(playerList.total4).toFixed(2)) : 0
    }
    const columns = GetRemainingColumns(maxLength);



    return {remaingPlayerList, columns};
  } catch(e) {
    console.log(`league-view api error (fetching all team scoring/player data):  ${e}`);
    
  }

}
