import React, { useState, useEffect } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import axios from "axios";
import PlayerColumn from '../components/PlayerColumn';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import ConditionalButon from "../components/ConditionalButton";
import RequireAuth from "../components/RequireAuth";

export default function TeamBuilder({ session, timeCutoff }) {
  
  const [playerList, setPlayerList] = useState([]);
  const [foundPlayers, setFoundPlayers] = useState([]);
  const [entry, setEntry] = useState('');
  const [addedTags, setAddedTags] = useState([]); 
  const [entrySubmitted, setEntrySubmitted] = useState(false);
  const [afterTimeWarning, setAfterTimeWarning] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [teamSelection, setTeamSelection] = 
  useState({
    qb:[null,'QB', null, null],
    rb1:[null,'RB', null, null],
    rb2:[null,'RB', null, null],
    wr1:[null,'WR', null, null],
    wr2:[null,'WR', null, null],
    te:[null,'TE', null, null],
    flex1:[null,'FLEX', null, null],
    flex2:[null,'FLEX', null, null],
    flex3:[null,'FLEX', null, null],
    flex4:[null,'FLEX', null, null],
    k:[null,'K', null, null],
    dst:[null,'DST', null, null]

  });
 
  const startTimeDate = new Date(timeCutoff);
  const startTime = Date.parse(timeCutoff); 
  const now = Date.now();
  const email = session.user.email;

  const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const submitTeam = async () => {
    //block new submissions after deadline
    if(now > startTime) {
      setAfterTimeWarning(true);
      return;
    }
    setWaitingResponse(true);
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    const {qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst} = teamSelection;
    try {
      await axios.post(
          '/api/team-builder', 
          {
            email, qb:qb[0], rb1:rb1[0], rb2:rb2[0], wr1:wr1[0], 
            wr2:wr2[0], te:te[0], flex1:flex1[0], flex2:flex2[0], 
            flex3:flex3[0], flex4:flex4[0], k:k[0], dst:dst[0]
          },
          {
            headers,
          }
      );
    } catch (e) {
      setSubmissionError(true);
      console.log(e)
      setWaitingResponse(false);
      return;
    }
      setWaitingResponse(false);
      setEntrySubmitted(true);
  }

  useEffect(() =>{
    const fetchPlayers = async () => {
      const players = await axios.get(`/api/team-builder/?email=${encodeURIComponent(email)}`)
      const fetchedPlayerList = players.data.playerList;
      const fetchedDefList = players.data.defList;
      const userTeam = players.data.userTeam;
      
      let formattdPlayerList = fetchedPlayerList.map(el =>[el.player_id, `${el.nfl_team}, ${el.player_name}, ${el.position}`, el.color, el.alternate_color])
      const totalList = formattdPlayerList.concat(fetchedDefList.map(el => [el.def_id,`${el.nfl_team} -- DST`, el.color, el.alternate_color]))
      setPlayerList(totalList);
      console.log(userTeam);
      console.log(fetchedPlayerList);
      // If user has an existing team, populate teamSelection
      if (userTeam) {
        setTeamSelection(userTeam);

        // Update addedTags based on populated team
        const tags = [];
        Object.values(userTeam).forEach(entry => {
          if (entry[0] !== null) {
            const playerText = entry[1];
            const playerTags = (playerText.includes('--') ? playerText.split(' ') : playerText.split(", "));
            if (['QB','K', 'DST'].includes(playerTags[2])) {
              tags.push(playerTags[0], playerTags[2]);
            } else {
              tags.push(playerTags[0]);
            }
          }
        });
        setAddedTags(tags);
      }
    };
    fetchPlayers()
  }, [email]);
  
  //logic to search for players in drop down list
  const filter = e => {
    const keyword = e.target.value.trim();

    if(keyword !== ''){
      const keywords = keyword.split(' ');
      let filteredPlayers = playerList.filter(player => {
        return keywords.every(keyword => player[1].toLowerCase().includes(keyword.toLowerCase()));

    }) 
    setFoundPlayers(filteredPlayers);
    } else {
      setFoundPlayers(playerList)
    }
    setEntry(keyword);
  }

  const addPlayer = e => {
    const playerText = e.target.outerText;
    const playerId = e.target.attributes.playerid.value;
    const color = e.target.attributes.color.value;
    const alternateColor = e.target.attributes.alternateColor.value;
    const listEntry = [playerId, playerText, color, alternateColor];
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
  }

  const removePlayer = e => {
    
    const stateID = e.target.id
    const updated = {...teamSelection};
    // Map slot names to position names
    const positionMap = {
      qb: 'QB', rb1: 'RB', rb2: 'RB', wr1: 'WR', wr2: 'WR', 
      te: 'TE', flex1: 'FLEX', flex2: 'FLEX', flex3: 'FLEX', 
      flex4: 'FLEX', k: 'K', dst: 'DST'
    };
    const position = positionMap[stateID] || 'FLEX';
    updated[stateID] = [null, position, null, null];
    setTeamSelection(updated);

    const playerText = e.target.outerText;
    const playerTags = (playerText.includes('--') ? playerText.split(' ') : playerText.split(", "));
    const currTags = [...addedTags];

    const teamIndex = addedTags.indexOf(playerTags[0]);
    const posIndex = addedTags.indexOf(playerTags[2]);

    if(teamIndex !== -1) delete currTags[teamIndex];
    if((posIndex !== -1) && ['QB','K', 'DST'].includes(playerTags[2])) delete currTags[posIndex];
      
    setAddedTags(currTags);

  }

  const handleClick = () => {
    setOpen(true);
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSubmissionError(false);
    setEntrySubmitted(false);
    setAfterTimeWarning(false);
  }

  return (
    <RequireAuth session={session}> 
      <div>
        <h1>Welcome {email}</h1>
        <h3>Make and submit your player selection. </h3>
        <h4>Clicking players under the Team Selection column will deselect them.  
          If you select a player that is incompatible with your current selection, the players name will turn red and not be added. </h4>
        <h4>New submissions will overwrite previous submissions - available until {startTimeDate.toLocaleString()} </h4>
        
        <Grid 
          container 
          spacing={{ xs: 1, sm: 3, md: 4 }} 
          columns={{ xs: 4, sm: 8, md: 12 }}
          direction="row"
          width={"100%"}
          >
          <Grid item xs={2} sm={4} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}> 
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Team Selection
                </Typography>
                <Typography>
                  <PlayerColumn teamSelection={teamSelection} removePlayer={removePlayer} />
                </Typography>
              </CardContent>
              <CardActions>
                <ConditionalButon submitTeam={submitTeam} waitingResponse={waitingResponse}>Submit Team</ConditionalButon> :
              </CardActions>
            </Card>  
          </Grid>
          <Grid item xs={2} sm={4} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>      
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
            {foundPlayers.map(el => (<li className="list-group-item" key={el[0]} playerid={el[0]} color={el[2]} alternateColor={el[3]} onClick={addPlayer}>{el[1]}</li>))} 
            </List>
            </CardContent>
            </Card> 
          </Grid>
        </Grid>  
        <Snackbar open={entrySubmitted} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success">
            Entry successfully submitted!
          </Alert>
        </Snackbar>
        <Snackbar open={afterTimeWarning} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="warning">
            Cannot update lineup: submissions accepted until {startTimeDate.toLocaleString()}
          </Alert>
        </Snackbar>
        <Snackbar open={submissionError} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error">
            Error submitting linup. Make sure your entry is valid.
          </Alert>
        </Snackbar>
      </div>
    </RequireAuth>
  )
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
}