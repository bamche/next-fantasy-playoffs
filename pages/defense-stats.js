import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const columns = [
  {
    field: 'team',
    headerName: 'Team',
    type: 'number',
    width: 80,
    editable: false,
  }, 
  {
    field: 'total_score',
    headerName: 'Total Points',
    type: 'number',
    width: 110,
    editable: false,
  },
  {
    field: 'sack',
    headerName: 'Sacks',
    type: 'number',
    width: 80,
    editable: false,
  },
  {
    field: 'turnover',
    headerName: 'Turnovers',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'block_ret',
    headerName: 'Returns after XP/2PT ',
    type: 'number',
    width: 170,
    editable: false,
  },
  {
    field: 'sfty',
    headerName: 'Safetys',
    type: 'number',
    width: 80,
    editable: false,
  },
  {
    field: 'td',
    headerName: 'Touchdowns',
    type: 'number',
    width: 110,
    editable: false,
  },
  {
    field: 'pts_allowed',
    headerName: 'Score (Pts Allowed)',
    type: 'number',
    width: 170,
    editable: false,
  },
];


columns.forEach(ele => {
  ele.align = 'center'
  ele.headerAlign = 'center'
})

export default function defenseStats({ session }){
  const [rows, setRows] = useState([])
 
  useEffect(() =>{
  const fetchPlayer = async () => {
    const tempRows = []
    const stats = await axios.get('/api/defense-stats');
    const defStats = stats.data.defenseStats;
    const weeks = [1,2,3,4]
    
    //process offensive information from database and calculate scores
    defStats.forEach( (ele, id) => {
      const playerObject = {};
      playerObject.id = id;
      playerObject.team = ele.nfl_team;

      
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

      //temporary value to hold scores through iteration
      let total = 0;
      
      //iterate through all weeks for total
      weeks.forEach( week => {
        //score tally for each week
        let weekTotal = 0;

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
            playerObject.pts_allowed += 12;
          } else if(pointsAllowed < 7){
            weekTotal += 8;
            playerObject.pts_allowed += 8;
          } else if(pointsAllowed < 11){
            weekTotal += 5
            playerObject.pts_allowed += 5;
          } else if( pointsAllowed < 18) {
            weekTotal += 2;
            playerObject.pts_allowed += 2;
          
          }
        
        } else{
          if(playerObject[stat] !== undefined) playerObject[stat] += ele[stat+week];
          else playerObject[stat] = ele[stat+week];
          weekTotal += ele[stat+week]*(defStatRecordPoints[id])
        }})

        //add to overall total
        total += weekTotal;
      })

      playerObject.total_score = total; 
      tempRows.push(playerObject)
      
    })
    
    setRows(tempRows);
    
    
  };
  fetchPlayer();
}, []);
  return(
    <div> 
      <h1>All Defense Stats </h1>
      <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={20}
        disableSelectionOnClick
        disableColumnMenu
        density={'compact'}
        components={{
          Toolbar: GridToolbar,
        }}
      />
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);

  return {
    props: {
      session: sessionUser,
    },
  };
}