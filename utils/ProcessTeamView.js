import { defStatRecords, defStatRecordPoints, offStatRecords, offStatRecordPoints} from "./constants";

export default function ProcessTeamView(playerStats, defStats) {
    const tempRows = [];
    const weeks = [1,2,3,4];
    let totalTeamScore = 0;
    let defTotal = 0;

    //process defensive information from database and calculate scores
    const defObject = {};
    defObject.id = 11;
    defObject.playerid = defStats.def_id; 
    defObject.name = `${defStats.nfl_team} - DST`;
    defObject.position = 'DST';
    defObject.team = defStats.nfl_team;

    weeks.forEach( week => {
      // defensive score tally for each week
      let defWeekTotal = 0;
      const superBowlFactor =  week === 4 ? 1.5 : 1;
      defStatRecords.forEach( (stat, id) => {
        defObject[stat+week] = defStats[stat+week];

        //allow for points allowed scoring logic
        if(id === 5) {
          const pointsAllowed = defStats[stat+week];
          if(pointsAllowed === null){
            defWeekTotal += 0
          } 
            else if(pointsAllowed === 0 ){
            defWeekTotal += 12*superBowlFactor
          } else if(pointsAllowed < 7){
            defWeekTotal += 8*superBowlFactor
          } else if(pointsAllowed < 11){
            defWeekTotal += 5*superBowlFactor
          } else if( pointsAllowed < 18) {
            defWeekTotal += 2*superBowlFactor  //NOTE CHANGE FROM PREVIOUS SEASON
          }
        
        } else{
          defWeekTotal += defStats[stat+week]*(defStatRecordPoints[id])*superBowlFactor
        }
      });
      
      //write field for individual week total then add to overall total
      defObject[`week-${week}`] = defWeekTotal;
      defTotal += defWeekTotal;
    });
    defObject.total_score = defTotal;
    totalTeamScore += defTotal;

    //process offensive information from database and calculate scores
    playerStats.forEach( (ele, id) => {
      const playerObject = {};
      playerObject.id = id;
      playerObject.playerid = ele.player_id; 
      playerObject.name = ele.player_name;
      playerObject.position = ele.position;
      playerObject.team = ele.nfl_team;

      //temporary value to hold scores through iteration
      let total = 0;
      
      //iterate through all weeks for total
      weeks.forEach( week => {
        //score tally for each week
        let weekTotal = 0;
        const superBowlFactor =  week === 4 ? 1.5 : 1;
        offStatRecords.forEach( (stat, id) => {
          playerObject[stat+week] = ele[stat+week];
          weekTotal += ele[stat+week]*(offStatRecordPoints[id])*superBowlFactor
        })

        //write field for individual week total then add to overall total
        playerObject[`week-${week}`] = weekTotal;
        total += weekTotal;
      })

      totalTeamScore += total;
      playerObject.total_score = total; 
      tempRows.push(playerObject)
    })
    tempRows.push(defObject)
    tempRows.push({id: 12, name:'Total Team Score', total_score: totalTeamScore})
    return tempRows;
}