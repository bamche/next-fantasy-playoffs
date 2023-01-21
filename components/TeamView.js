import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const columns = [
  {
    field: 'name',
    headerName: 'Player name',
    width: 180,
    editable: false,
  },
  {
    field: 'position',
    headerName: 'Position',
    width: 120,
    editable: false,
  },
  {
    field: 'team',
    headerName: 'Team',
    type: 'number',
    width: 120,
    editable: false,
  },
  {
    field: 'week-1',
    headerName: 'Wild Card',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'week-2',
    headerName: 'Divisional',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'week-3',
    headerName: 'Conference',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'week-4',
    headerName: 'Super Bowl',
    type: 'number',
    width: 130,
    editable: false,
  },
  {
    field: 'total_score',
    headerName: 'Total',
    type: 'number',
    width: 120,
    editable: false,
  },
];
columns.forEach(ele => {
  ele.align = 'center'
  ele.headerAlign = 'center'
})

function TeamView({ session }){
  const [rows, setRows] = useState([])
  const email = session.user.email;
   
  
  useEffect(() =>{
  const fetchPlayer = async () => {
    const statsRespose = await axios.get('/api/player-stats', { params:{email} } );
    const teamViewStats = statsRespose.data.teamViewStats;
    setRows(teamViewStats);
  };
  fetchPlayer();
}, []);
  return(
    <div > 
      <h1>{email} - Team View </h1>
      <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        density={'compact'}
        pageSize={13}
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

export default TeamView;

