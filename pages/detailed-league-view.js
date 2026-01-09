import React from "react";
import { getSession } from 'next-auth/react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { isLeagueStart, TIME_CUT_OFF } from "../utils/constants";
import GetleagueView from "../utils/GetLeagueView"
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

export default function LeagueView({ session, leagueStats }){
    const startTimeDate = new Date(TIME_CUT_OFF);
    const email = session.user.email;

  return(
    <div > 
      <h1> Detailed League View </h1>
      {!isLeagueStart() && (
        <h2> *** Detailed League View available after {startTimeDate.toLocaleString()} ***</h2>
      )}
      <div style={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={leagueStats}
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

  if (!isLeagueStart()) {
    return {
      props: {
        session: sessionUser,
        leagueStats: [],
      },
    };
  }

  let leagueStats = [];
  try {
    const { default: redisClient } = await import('../lib/redisClient');
    const cache = await redisClient.get('detailed-league-view')
    if (!cache) {
      leagueStats = await GetleagueView()
      console.log('cache miss')
      redisClient.set('detailed-league-view', JSON.stringify(leagueStats));
      redisClient.expire('detailed-league-view', 60 * 60 * 3); // 3 hours
    } else {
      leagueStats = JSON.parse(cache);
    }
    console.log('leagueStats', leagueStats)
  } catch (err) {
    console.log(`server side error in league-view: ${err}`);
  }

  return {
    props: {
      session: sessionUser,
      leagueStats,
    },
  };
}