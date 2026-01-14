import React from "react";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { isLeagueStart, TIME_CUT_OFF } from "../utils/constants";
import GetleagueView from "../utils/GetLeagueView"
import EmailLink from "../components/EmailLink"
import { authOptions } from "./api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import RequireAuth from "../components/RequireAuth"

const columns = [
  {
    field: 'total',
    headerName: 'Total Score',
    width: 150,
  },
  { 
    field: 'email', 
    headerName: 'email', 
    width: 170,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params) => (
      <EmailLink email={params.value} />
    ),
  },
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
 

  return(
    <RequireAuth session={session}>
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
    </RequireAuth>
  );
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!isLeagueStart()) {
    return {
      props: {
        session,
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
  } catch (err) {
    console.log(`server side error in league-view: ${err}`);
  }

  return {
    props: {
      session,
      leagueStats,
    },
  };
}