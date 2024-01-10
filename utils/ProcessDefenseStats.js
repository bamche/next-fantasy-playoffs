import { defStatRecords, defStatRecordPoints } from "./constants";
export default function ProcessDefenseStats (defStats) {

    const tempRows = [];
    // const defStats = stats.data.defenseStats;
    const weeks = [1,2,3,4]
    
    //process offensive information from database and calculate scores
    defStats.forEach( (ele, id) => {
      const playerObject = {};
      playerObject.id = id;
      playerObject.team = ele.nfl_team;

      //temporary value to hold scores through iteration
      let total = 0;
      
      //iterate through all weeks for total
      weeks.forEach( week => {
        //score tally for each week
        let weekTotal = 0;
        const superBowlFactor =  week === 4 ? 1.5 : 1;
        defStatRecords.forEach( (stat, id) => {

          //add up each stat week by week to condense to a total

          //allow for points allowed scoring logic
        if(id === 5) {
          const pointsAllowed = ele[stat+week];
          if(playerObject.pts_allowed === undefined) playerObject.pts_allowed = 0;
          if(pointsAllowed === null){
            weekTotal += 0;
            playerObject.pts_allowed += 0;
          } 
            else if(pointsAllowed === 0 ){
            weekTotal += 12;
            playerObject.pts_allowed += 12*superBowlFactor;
          } else if(pointsAllowed < 7){
            weekTotal += 8;
            playerObject.pts_allowed += 8*superBowlFactor;
          } else if(pointsAllowed < 11){
            weekTotal += 5
            playerObject.pts_allowed += 5*superBowlFactor;
          } else if( pointsAllowed < 18) {
            weekTotal += 2;
            playerObject.pts_allowed += 2*superBowlFactor;
          
          }
        
        } else{
          if(playerObject[stat] !== undefined) playerObject[stat] += ele[stat+week];
          else playerObject[stat] = ele[stat+week];
          weekTotal += ele[stat+week]*(defStatRecordPoints[id])*superBowlFactor
        }})

        //add to overall total
        total += weekTotal;
      })

      playerObject.total_score = total; 
      tempRows.push(playerObject)
      
    })
    
    return tempRows;
}