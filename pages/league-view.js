import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getSession } from 'next-auth/react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const columns = [
  {
    field: 'total',
    headerName: 'Total Score',
    width: 150,
  },
  { 
    field: 'email', 
    headerName: 'email', 
    width: 130 },
  { 
    field: 'qb', 
    headerName: 'QB', 
    width: 130 },
  {
    field: 'rb1',
    headerName: 'RB1',
    width: 130,
  },
  {
    field: 'rb2',
    headerName: 'RB2',
    width: 130,
  },
  {
    field: 'wr1',
    headerName: 'WR1',
    width: 130,
  },
  {
    field: 'wr2',
    headerName: 'WR2',
    width: 130,
  },
  {
    field: 'te',
    headerName: 'TE',
    width: 130,
  },
  {
    field: 'flex1',
    headerName: 'FLEX1',
    width: 130,
  },
  {
    field: 'flex2',
    headerName: 'FLEX2',
    width: 130,
  },
  {
    field: 'flex3',
    headerName: 'FLEX3',
    width: 130,
  },
  {
    field: 'flex4',
    headerName: 'FLEX4',
    width: 130,
  },
  {
    field: 'k',
    headerName: 'K',
    width: 130,
  },
  {
    field: 'dst',
    headerName: 'DST',
    width: 100,
  },
  {
    field: 'week1',
    headerName: 'Wild Card',
    width: 120,
  },
  {
    field: 'week2',
    headerName: 'Divisional',
    width: 120,
  },
  {
    field: 'week3',
    headerName: 'Conference',
    width: 120,
  },
  {
    field: 'week4',
    headerName: 'Super Bowl',
    width: 120,
  },
  
];
columns.forEach(ele => {
  ele.align = 'center'
  ele.headerAlign = 'center'
})

export default function LeagueView({ session, timeCutoff }){
  const startTimeDate = new Date(timeCutoff);
  const startTime = Date.parse(timeCutoff); 
  const now = Date.now();
  const email = session.user.email;
  const [rows, setRows] = useState([])

  useEffect(() =>{
  const fetchPlayer = async () => {
    if (now < startTime) return;

    const tempRows = [];
    const stats = await axios.get('/api/league-view');
    const leagueStats = stats.data.leagueStats;

    let teamID = 0
    for ( const [email, stats] of Object.entries(leagueStats)) {

      const teamObject = {};
      const defStats = stats.defense;
      const offStats = stats.offense;

      //write properties to to teamobject - which is used by table to display stats
      teamObject.week1 = parseFloat(defStats[`points${1}`]) || 0;
      teamObject.week2 = parseFloat(defStats[`points${2}`]) || 0;
      teamObject.week3 = parseFloat(defStats[`points${3}`]) || 0;
      teamObject.week4 = parseFloat(defStats[`points${4}`]) || 0;      
      teamObject.id = teamID;
      teamObject.email = email;
      teamObject.dst = defStats.nfl_team;

      const weeks = [1,2,3,4];

      //array to handle position tags to match with columns
      const positionList = ['qb', 'rb1', 'rb2', 'wr1', 'wr2', 'te', 'flex1', 'flex2', 'flex3', 'flex4', 'k', 'dst']
      
      //process offensive information from database and calculate scores
      offStats.forEach( (ele, id) => {      
        //since we have ordered data on backend we can use id to match correctly with position list
        teamObject[positionList[id]] = ele.player_name;
        
        //iterate through all weeks
        weeks.forEach( week => {
          teamObject[`week${week}`] += parseFloat(ele[`points${week}`]) || 0;
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
    setRows(tempRows);
  };
  fetchPlayer();
}, []);
  return(
    <div > 
      <h1> Leader Board </h1>
      {now < startTime && (
        <h2> *** Leader Board available after {startTimeDate.toLocaleString()} ***</h2>
      )}
      <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        // pageSize={18}
        density={'compact'}
        disableSelectionOnClick
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