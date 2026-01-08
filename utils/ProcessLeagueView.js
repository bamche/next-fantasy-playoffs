import { positionList, defStatRecords, defStatRecordPoints} from "./constants";

export default function ProcessLeagueView(leagueStats) {

//     const stats = await axios.get('/api/detailed-league-view');
//  const leagueStats = stats.data.leagueStats;
    const tempRows = [];
    let teamID = 0;
    for (const [email, stats] of Object.entries(leagueStats)) {

    const teamObject = {};
    
    //score totals for each week
    teamObject.week1 = 0;
    teamObject.week2 = 0;
    teamObject.week3 = 0;
    teamObject.week4 = 0;

    const defStats = stats.defense;
    const offStats = stats.offense;

    const weeks = [1,2,3,4]

    //process offensive information from database and calculate scores
    
    teamObject.id = teamID;
    teamObject.email = email;
    teamObject.dst = defStats.nfl_team;

    weeks.forEach( week => {
        const superBowlFactor =  week === 4 ? 1.5 : 1
        defStatRecords.forEach((stat, id) => {
        

        //allow for points allowed scoring logic
        if(id === 5) {
            const pointsAllowed = defStats[stat+week];
            if(pointsAllowed === null){
            teamObject['week'+ week] += 0
            } 
            else if(pointsAllowed === 0 ){
            teamObject['week'+ week] += (12 * superBowlFactor)
            } else if(pointsAllowed < 7){
            teamObject['week'+ week] += (8 * superBowlFactor)
            } else if(pointsAllowed < 11){
            teamObject['week'+ week] += (5 * superBowlFactor)
            } else if( pointsAllowed < 18) {
            teamObject['week'+ week] += (2 * superBowlFactor)  //NOTE CHANGE FROM PREVIOUS SEASON
            }
        
        } else{
            teamObject['week'+ week] += defStats[stat+week]*(defStatRecordPoints[id]) * superBowlFactor
        }
        
        });
    });

    //process offensive information from database and calculate scores
    offStats.forEach( (ele, id) => {

        //since we have ordered data on backend we can use id to match correctly with position list
        teamObject[positionList[id]] = ele.player_name;

        //temporary value to hold scores through iteration
        let total = 0;
        
        //iterate through all weeks
        weeks.forEach( week => {
            const weekScore = ele['points' + week] ?? 0;
            teamObject['week'+ week] += parseFloat(weekScore);
        
        });
        
    });
    //sum up each week total for overall total
    teamObject.week1 = Number((teamObject.week1).toFixed(2)); 
    teamObject.week2 = Number((teamObject.week2).toFixed(2)); 
    teamObject.week3 = Number((teamObject.week3).toFixed(2));
    teamObject.week4 = Number((teamObject.week4).toFixed(2));
    teamObject.total =  Number((teamObject.week1 + teamObject.week2 + teamObject.week3 + teamObject.week4).toFixed(2)); 
    tempRows.push(teamObject);
    teamID++;
    };
   
    return tempRows;
}
 