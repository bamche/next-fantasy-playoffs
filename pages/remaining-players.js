import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getSession } from 'next-auth/react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import GetRemainingView from '../utils/GetRemainingView'
import { TIME_CUT_OFF, isLeagueStart } from "../utils/constants";



export default function RemainingPlayersView({ session, leagueStats, columns }){
    const email = session.user.email;

    
    columns.forEach(ele => {
      ele.align = 'center'
      ele.headerAlign = 'center'
    })

  return(
    <div > 
      <h1> Remaining Player Leader Board </h1>
      {!isLeagueStart() && (
            <h2> *** Available after {new Date(TIME_CUT_OFF).toLocaleString()} ***</h2>
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
  let remaingPlayerListData, columnsData
  if (!isLeagueStart()) {
    remaingPlayerListData = [];
    columnsData = []
  } else {
    const {remainingPlayers, columns} = await GetRemainingView();
    console.log(remainingPlayers)
    remaingPlayerListData = remainingPlayers;
    columnsData = columns;
    // console.log(await GetRemainingView())
    // remaingPlayerListData = [];
    // columnsData = []
  }
  return {
    props: {
      session: sessionUser,
      leagueStats: remaingPlayerListData,
      columns: columnsData
    },
  };
}