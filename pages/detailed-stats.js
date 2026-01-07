import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getSession } from 'next-auth/react';
import { positionList, defStatRecords, defStatRecordPoints, offStatRecords, offStatRecordPoints, TIME_CUT_OFF, isLeagueStart} from "../utils/constants";

const columns = [

  {
    field: 'name',
    headerName: 'Player name',
    width: 150,
    editable: false,
  },
  {
    field: 'position',
    headerName: 'Position',
    width: 100,
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
    width: 110,
    editable: false,
  },
  {
    field: 'pass_yd',
    headerName: 'Pass yds',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'pass_td',
    headerName: 'Pass TDs',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'interception',
    headerName: 'INT',
    type: 'number',
    width: 80,
    editable: false,
  },
  {
    field: 'rush_yd',
    headerName: 'Rush yds',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'rush_td',
    headerName: 'Rush TDs',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'rec_yd',
    headerName: 'Rec yds',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'rec_td',
    headerName: 'Rec TDs',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'rec',
    headerName: 'Rec\'s',
    type: 'number',
    width: 80,
    editable: false,
  },
  {
    field: 'te_rec',
    headerName: 'TE Rec\'s',
    type: 'number',
    width: 100,
    editable: false,
  },
  {
    field: 'two_pt',
    headerName: '2PC',
    type: 'number',
    width: 80,
    editable: false,
  },
  
 
];

columns.forEach(ele => {
  ele.align = 'center'
  ele.headerAlign = 'center'
})

export default function OffenseStats({ session }){
  const [rows, setRows] = useState([])
 
  useEffect(() =>{
  const fetchPlayer = async () => {
    if(!isLeagueStart()) return;
    const tempRows = []
    const stats = await axios.get('/api/detailed-stats');
    const playerStats = stats.data.offensePlayerStats;
    
    const weeks = [1,2,3,4]

    //process offensive information from database and calculate scores
    playerStats.forEach( (ele, id) => {
      const playerObject = {};
      playerObject.id = id;
      playerObject.playerid = ele.player_id; 
      playerObject.name = ele.player_name;
      playerObject.position = ele.position;
      playerObject.team = ele.abbreviation;

      //temporary value to hold scores through iteration
      let total = 0;
      
      //iterate through all weeks for total
      weeks.forEach( week => {
        //score tally for each week
        let weekTotal = 0;
        const superBowlFactor =  week === 4 ? 1.5 : 1;
        Object.entries(offStatRecordPoints).forEach(([stat, points]) => {
          //add up each stat week by week to condense to a total
          if(playerObject[stat] !== undefined) playerObject[stat] += ele[stat+week];
          else playerObject[stat] = ele[stat+week];
          weekTotal += ele[stat+week]*(points)*superBowlFactor
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
      <h1>Detailed Player Stats </h1>
      {!isLeagueStart() && (
            <h2> *** Available after {new Date(TIME_CUT_OFF).toLocaleString()} ***</h2>
          )}
      <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={20}
        density={'compact'}
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