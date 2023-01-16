import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getSession } from 'next-auth/react';

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

export default function defenseStats(){
  const [rows, setRows] = useState([])
 
  useEffect(() =>{
  const fetchPlayer = async () => {
    const defenseStats = await axios.get('/api/defense-stats'); 
    const stats = defenseStats.data.defenseStats;
    setRows(stats);    
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