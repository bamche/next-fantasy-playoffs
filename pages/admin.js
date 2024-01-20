
import React from "react";
import { getSession } from 'next-auth/react';
import axios from "axios";
import Button from '@mui/material/Button';

export default function Admin({ session }) {
  if (session.user.email != process.env.NEXT_PUBLIC_ADMIN) {
    throw new Error("Unauthorized to view this page");
  }

  function onSubmit(e) {
    e.preventDefault();

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
    console.log('gameID:'+e.target[0].value, 'week: '+e.target[1].value)
    axios.post('/api/admin/get-game-stats', null, {headers,params:{gameID:e.target[0].value, week:e.target[1].value, key:e.target[2].value}})
        .then(res => console.log(res))

  }

  async function updatePlayerList() {
    const playerListLog = await axios.get('/api/admin/get-player-list');
    console.log(playerListLog);
  }

    return (
        <div className="App">
          <h1>API Query</h1>
          <div id="api-query-form">
              <form method={'POST'} onSubmit={onSubmit} >
                  <input name="gameID" type="text" placeholder="YYYYMMDD-{away team}-{home team}" className="form-control"></input>
                  <input name="week" type="text" placeholder="week 1/2/3/4" className="form-control"></input>
                  <input name="key" type="text" placeholder="key" className="form-control"></input>
                  <div className="d-grid gap-2 ">
                      <input type='submit' value="submit" id="submit-query-button" className="btn btn-primary"></input>

                  </div>
              </form>

              <Button size="small" variant="contained" onClick={updatePlayerList}>Udpate Player List</Button> 
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