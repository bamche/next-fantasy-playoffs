import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getSession } from 'next-auth/react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import GetRemainingPlayersView from '../utils/GetRemainingPlayersView'
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
    const {remaingPlayerList, columns} = await GetRemainingPlayersView();
    remaingPlayerListData = remaingPlayerList
    columnsData = columns
  }
  return {
    props: {
      session: sessionUser,
      leagueStats: remaingPlayerListData,
      columns: columnsData
    },
  };
}