import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const columns = [
  { 
    field: 'playerid', 
    headerName: 'Player ID', 
    width: 130 },
  {
    field: 'name',
    headerName: 'Player name',
    width: 180,
    editable: false,
  },
  {
    field: 'position',
    headerName: 'Position',
    width: 120,
    editable: false,
  },
  {
    field: 'team',
    headerName: 'Team',
    type: 'number',
    width: 120,
    editable: false,
  },
  {
    field: 'week-1',
    headerName: 'Wild Card',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'week-2',
    headerName: 'Divisional',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'week-3',
    headerName: 'Conference',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'week-4',
    headerName: 'Super Bowl',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'total_score',
    headerName: 'Total',
    type: 'number',
    width: 120,
    editable: false,
  },
];


function TeamView({ session }){
  const [rows, setRows] = useState([])
  
  const email = session.user.email;
   
  
  useEffect(() =>{
  const fetchPlayer = async () => {
    const tempRows = []
    const stats = await axios.get('/api/player-stats', { params:{email} } );
    const playerStats = stats.data.playerStats;
    let totalTeamScore = 0;
    const defStats = stats.data.defStats;
    const weeks = [1,2,3,4]

    //process defensive information from database and calculate scores
    const defObject = {};
    defObject.id = 11;
    defObject.playerid = defStats.def_id; 
    defObject.name = `${defStats.nfl_team} - DST`;
    defObject.position = 'DST';
    defObject.team = defStats.nfl_team;

    //name of individual defensive stats
    const defStatRecords = [
      'sack',
      'turnover',
      'block_ret',
      'sfty',
      'td',
      'pts_allowed'
    ];

    //defensive stats point value, x is placeholder
    const defStatRecordPoints = [
      1, 2, 2, 5, 6, 'X'
    ];

    let defTotal = 0;

    weeks.forEach( week => {
      // defensive score tally for each week
      let defWeekTotal = 0;

      defStatRecords.forEach( (stat, id) => {
        defObject[stat+week] = defStats[stat+week];

        //allow for points allowed scoring logic
        if(id === 5) {
          const pointsAllowed = defStats[stat+week];
          if(pointsAllowed === null){
            defWeekTotal += 0
          } 
            else if(pointsAllowed === 0 ){
            defWeekTotal += 12
          } else if(pointsAllowed < 7){
            defWeekTotal += 8
          } else if(pointsAllowed < 11){
            defWeekTotal += 5
          } else if( pointsAllowed < 18) {
            defWeekTotal += 2  //NOTE CHANGE FROM PREVIOUS SEASON
          }
        
        } else{
          defWeekTotal += defStats[stat+week]*(defStatRecordPoints[id])
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

      
      //name of individual offensive stats
      const offStatRecords = ['pass_yd', 'pass_td', 'interception', 'rush_yd', 'rush_td',
      'rec_yd', 'rec_td', 'rec', 'te_rec', 'two_pt', 'fg30', 'fg40', 'fg50', 'xtpm']
      
      //individual value of stats
      const offStatRecordPoints = [
        0.025, 4, -2, 0.1, 6,
        .1, 6, 1, 1.5, 2, 3, 4, 5, 1
      ];

      //temporary value to hold scores through iteration
      let total = 0;
      
      //iterate through all weeks for total
      weeks.forEach( week => {
        //score tally for each week
        let weekTotal = 0;

        offStatRecords.forEach( (stat, id) => {
          playerObject[stat+week] = ele[stat+week];
          weekTotal += ele[stat+week]*(offStatRecordPoints[id])
        })

        //write field for individual week total then add to overall total
        playerObject[`week-${week}`] = weekTotal;
        total += weekTotal;
      })

      totalTeamScore += total;
      playerObject.total_score = total; 
      tempRows.push(playerObject)
      console.log(playerObject)
    })
    tempRows.push(defObject)
    tempRows.push({id: 12, name:'Total Team Score', total_score: totalTeamScore})
    setRows(tempRows);
    
    
  };
  fetchPlayer();
}, []);
  return(
    <div > 
      <h1>{email} - Team View </h1>
      <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={13}
        disableSelectionOnClick
        disableColumnMenu
        components={{
          Toolbar: GridToolbar,
        }}
      />
      </div>
    </div>
  );
};

export default TeamView;

