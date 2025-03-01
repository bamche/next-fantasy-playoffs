import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getSession } from 'next-auth/react';
import { kickerStatRecordPoints, isLeagueStart, TIME_CUT_OFF } from "../utils/constants";

const columns = [
 
  {
    field: 'name',
    headerName: 'Player name',
    width: 150,
    editable: false,
  },
  {
    field: 'team',
    headerName: 'Team',
    type: 'number',
    width: 90,
    editable: false,
  }, 
  {
    field: 'total_score',
    headerName: 'Total Points',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'fg30',
    headerName: 'Field Goal <39',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'fg40',
    headerName: 'Field Goal 40-49',
    type: 'number',
    width: 150,
    editable: false,
  },
  {
    field: 'fg50',
    headerName: 'Field Goal 50+',
    type: 'number',
    width: 150,
    editable: false,
  },
  {
    field: 'xtpm',
    headerName: 'Extra Point',
    type: 'number',
    width: 110,
    editable: false,
  },
];

columns.forEach(ele => {
  ele.align = 'center'
  ele.headerAlign = 'center'
})

export default function KickerStats({ session }){
  const [rows, setRows] = useState([])
 
  useEffect(() =>{
  const fetchPlayer = async () => {
    if(!isLeagueStart()) return;
    const tempRows = []
    const stats = await axios.get('/api/kicker-stats');
    const playerStats = stats.data.kickerStats;
    
    const weeks = [1,2,3,4]


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

        Object.entries(kickerStatRecordPoints).forEach(([stat, points]) => {
          if(playerObject[stat] !== undefined) playerObject[stat] += ele[stat+week];
          else playerObject[stat] = ele[stat+week];
          weekTotal += ele[stat+week]*points*superBowlFactor
        })
        
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
      <h1>Kicker Stats </h1>
       {!isLeagueStart() && (
              <h2> *** Available after {new Date(TIME_CUT_OFF).toLocaleString()} ***</h2>
            )}
      <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={20}
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
export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);

  return {
    props: {
      session: sessionUser,
    },
  };
}