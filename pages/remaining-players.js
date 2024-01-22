import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getSession } from 'next-auth/react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import GetRemainingPlayersView from '../utils/GetRemainingPlayersView'



export default function RemainingPlayersView({ session, timeCutoff, leagueStats, columns }){
    const startTimeDate = new Date(timeCutoff);
    const startTime = Date.parse(timeCutoff); 
    const now = Date.now();
    const email = session.user.email;

    
    columns.forEach(ele => {
      ele.align = 'center'
      ele.headerAlign = 'center'
    })

  return(
    <div > 
      <h1> Remaining Player Leader Board </h1>
      {now < startTime && (
        <h2> *** Leader Board available after {startTimeDate.toLocaleString()} ***</h2>
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
  const {remaingPlayerList, columns} = await GetRemainingPlayersView();
  return {
    props: {
      session: sessionUser,
      leagueStats: remaingPlayerList,
      columns
    },
  };
}