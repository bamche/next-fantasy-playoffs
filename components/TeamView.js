import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const columns = [
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
columns.forEach(ele => {
  ele.align = 'center'
  ele.headerAlign = 'center'
})

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

    let defTotal = 0;

    weeks.forEach( week => {
      // defensive score tally for each week
      const defWeeklyScore = parseFloat(defStats[`points${week}`]) || 0;
      defObject[`week-${week}`] = defWeeklyScore;
      defTotal += defWeeklyScore;
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

        //write field for individual week total then add to overall total
        const playerScore =  parseFloat(ele[`points${week}`]) || 0;
        playerObject[`week-${week}`] = playerScore;
        total += playerScore;
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
        density={'compact'}
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

