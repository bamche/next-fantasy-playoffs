import React, { useState, useEffect, useContext } from "react";
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';

import axios from "axios";
import PlayerColumn from '../components/PlayerColumn';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { makeStyles } from '@mui/styles';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export default function TeamBuilder({ session }) {
  
  const [playerList, setPlayerList] = useState([]);
  const [foundPlayers, setFoundPlayers] = useState([]);
  const [entry, setEntry] = useState('');
  const [teamSelection, setTeamSelection] = 
  useState({
    qb:[null,'QB'],
    rb1:[null,'RB'],
    rb2:[null,'RB'],
    wr1:[null,'WR'],
    wr2:[null,'WR'],
    te:[null,'TE'],
    flex1:[null,'FLEX'],
    flex2:[null,'FLEX'],
    flex3:[null,'FLEX'],
    flex4:[null,'FLEX'],
    k:[null,'K'],
    dst:[null,'DST']

  });
  const [addedTags, setAddedTags] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);   

  const email = session.user.email;

  //close alert snackbox
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlertOpen(false);
  };

  const submitTeam = async () => {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
  }

    const {qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst} = teamSelection;

    const postTeam = await axios.post(
      '/api/team-builder', 
      {
        email, 
        qb:qb[0], rb1:rb1[0], rb2:rb2[0], 
        wr1:wr1[0], wr2:wr2[0], te:te[0], 
        flex1:flex1[0], flex2:flex2[0], flex3:flex3[0], 
        flex4:flex4[0], k:k[0], dst:dst[0]
      },
      {
        headers,
      });

         
     if(postTeam.data.success) setAlertOpen(true);
     console.log(alertOpen)
  }
  
  const positionArray = ['qb', 'rb1', 'rb2', 'wr1', 'wr2', 'te', 'flex1', 'flex2', 'flex3', 'flex4', 'k', 'dst'];

  useEffect(() =>{
    const fetchPlayers = async () => {
      const players = await axios.get('/api/team-builder/')
      const fetchedPlayerList = players.data.playerList;
      const fetchedDefList = players.data.defList;
      
      let formattdPlayerList = fetchedPlayerList.map(el =>[el.player_id, `${el.nfl_team}, ${el.player_name}, ${el.position}`])
      const totalList = formattdPlayerList.concat(fetchedDefList.map(el => [el.def_id,`${el.nfl_team} -- DST`]))

      
      setPlayerList(totalList);
      
    };
    fetchPlayers()
  }, []);
  
  //logic to search for players in drop down list
  const filter = e => {

    const keyword = e.target.value;

    if(keyword !== ''){
      let filteredPlayers = playerList.filter(player => {
        return player[1].toLowerCase().includes(keyword.toLowerCase())

    }) 
    setFoundPlayers(filteredPlayers);
    } else {
      setFoundPlayers(playerList)
    }
    setEntry(keyword);
  };

  const addPlayer = e => {
    const playerText = e.target.outerText;
    const listEntry = [e.target.attributes.playerid.value, playerText];
    const playerTags = (playerText.includes('--') ? playerText.split(' ') : playerText.split(", "));

    const checkPosition = (position) => {
      if(['QB','K', 'DST'].includes(position) && addedTags.includes(position)){
        e.target.style.color = "red";
        return false;
      } return true;
    };

    const updateTags = () => {
      const currTags = [...addedTags];

      ['QB','K', 'DST'].includes(playerTags[2]) ? 
      currTags.push(playerTags[0],playerTags[2]) :
      currTags.push(playerTags[0])
      setAddedTags(currTags);

    };

    const flexSorting = (position) => {
      const flexes = ['flex1', 'flex2', 'flex3', 'flex4'];
      let positionSpecific;
      if(position === 'WR') positionSpecific = ['wr1', 'wr2'];
      if(position === 'RB') positionSpecific = ['rb1', 'rb2'];
      if(position === 'TE') positionSpecific = ['te'];

      const order = positionSpecific.concat(flexes);

      for(const el of order){
        if(teamSelection[el][0] === null) return el;
      } return false;
    };


    if(addedTags.includes(playerTags[0])) {
      e.target.style.color = "red"
    } else{
    const currPosition = playerTags[2];

    //logic for handling where to place player on list and checking selection meets team rules
    switch(currPosition){
      case 'QB':
        if(checkPosition(currPosition)) {
          setTeamSelection({...teamSelection,qb:listEntry}); 
          updateTags();
        } break;
        case 'K':
        if(checkPosition(currPosition)) {
          setTeamSelection({...teamSelection,k:listEntry})
          updateTags();
        } break;
        case 'DST':
        if(checkPosition(currPosition)) {
          setTeamSelection({...teamSelection,dst:listEntry})
          updateTags();
        } break;
        case 'WR':
        case 'TE':
        case 'RB':
        if(checkPosition(currPosition)) {
          const sorted = flexSorting(currPosition);
          if(sorted){
            const updated = {...teamSelection};
            updated[sorted] = listEntry;
            setTeamSelection(updated)
            updateTags();
          }
        } break;
      }
    }
      e.target.value = ''
  };

  const removePlayer = e => {
    
    const stateID = e.target.id
    const updated = {...teamSelection};
    updated[stateID] = [null,'empty'];
    setTeamSelection(updated);

    const playerText = e.target.outerText;
    const playerTags = (playerText.includes('--') ? playerText.split(' ') : playerText.split(", "));
    const currTags = [...addedTags];

    const teamIndex = addedTags.indexOf(playerTags[0]);
    const posIndex = addedTags.indexOf(playerTags[2]);

    if(teamIndex !== -1) delete currTags[teamIndex];
    if((posIndex !== -1) && ['QB','K', 'DST'].includes(playerTags[2])) delete currTags[posIndex];
      
    setAddedTags(currTags);

  };

  //need to add logic to rerout if no session?
  // if (!isLoggedIn) return <Redirect push to="/login" />
  
  return (
    <div>
      <h1>Welcome {email}</h1>
      <h3>Please make your player selection </h3>
      
      <Grid 
        container 
        spacing={{ xs: 1, sm: 3, md: 4 }} 
        columns={{ xs: 4, sm: 8, md: 12 }}
        direction="row"
        width={"100%"}
        >
        <Grid item xs={2} sm={4} md={4}>
          <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Team Selection
              </Typography>
              <Typography>
                <PlayerColumn teamSelection={teamSelection} removePlayer={removePlayer} />
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" onClick={submitTeam}>Submit Team</Button>
            </CardActions>
          </Card>  
        </Grid>
        <Grid item xs={2} sm={4} md={4}>
          <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >      
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
              Player List
              </Typography>
          <TextField 
            fullWidth 
            label="Search field" 
            id="search" 
            size="small"
            hiddenLabel
            onChange={filter}
          />
          <List
            sx={{
              width: '100%',
              maxWidth: 360,
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'auto',
              maxHeight: 380,
              '& ul': { padding: 0 },
            }}
            subheader={<li />}
          >
          {foundPlayers.map(el => (<li className="list-group-item" key={el[0]} playerid={el[0]} onClick={addPlayer}>{el[1]}</li>))} 
          </List>
          </CardContent>
          </Card> 
        </Grid>
      </Grid>  
      
    </div>

  )
};

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);

  return {
    props: {
      session: sessionUser,
    },
  };
}