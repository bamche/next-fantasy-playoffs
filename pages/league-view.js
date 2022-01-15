import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getSession } from 'next-auth/client';
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
    width: 130,
  },
  {
    field: 'week1',
    headerName: 'Wild Card',
    width: 150,
  },
  {
    field: 'week2',
    headerName: 'Divisional',
    width: 150,
  },
  {
    field: 'week3',
    headerName: 'Conference',
    width: 150,
  },
  {
    field: 'week4',
    headerName: 'Super Bowl',
    width: 150,
  },
  
];


export default function LeagueView({ session }){

  const email = session.user.email;
  const [rows, setRows] = useState([])

  useEffect(() =>{
  const fetchPlayer = async () => {
    const tempRows = []
    const stats = await axios.get('/api/league-view');
    const leagueStats = stats.data.leagueStats;

    let teamID = 0
    for( const [email, stats] of Object.entries(leagueStats)){

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

      weeks.forEach( week => {
        defStatRecords.forEach( (stat, id) => {
          
          //allow for points allowed scoring logic
          if(id === 5) {
            const pointsAllowed = defStats[stat+week];

            if(pointsAllowed === 0 ){
              teamObject['week'+ week] += 12
            } else if(pointsAllowed < 7){
              teamObject['week'+ week] += 8
            } else if(pointsAllowed < 11){
              teamObject['week'+ week] += 5
            } else if( pointsAllowed < 18) {
              teamObject['week'+ week] += 2  //NOTE CHANGE FROM PREVIOUS SEASON
            }
          
          } else{
            teamObject['week'+ week] += defStats[stat+week]*(defStatRecordPoints[id])
          }
          
        });
      });
      //array to handle position tags to match with columns
      const positionList = ['qb', 'rb1', 'rb2', 'wr1', 'wr2', 'flex1', 'flex2', 'flex3', 'flex4', 'k', 'dst']
      
      //process offensive information from database and calculate scores
      offStats.forEach( (ele, id) => {
        
        //since we have ordered data on backend we can use id to match correctly with position list
        teamObject[positionList[id]] = ele.player_name;
                
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
        
        //iterate through all weeks
        weeks.forEach( week => {

          //iterate through each stat multiplying by point value and adding to week total
          offStatRecords.forEach( (stat, id) => {
            teamObject['week'+ week] += ele[stat+week]*(offStatRecordPoints[id]);
            
          });
          
        });
        
      });
      //sum up each week total for overall total
      teamObject.total = (teamObject.week1 + teamObject.week2 + teamObject.week3 + teamObject.week4).toFixed(2);
      tempRows.push(teamObject);
      teamID++
    };
    setRows(tempRows);
  };
  fetchPlayer();
}, []);
  return(
    <div > 
      <h1> Leader Board </h1>
      <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={13}
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