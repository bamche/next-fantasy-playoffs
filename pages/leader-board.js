import React, { useState } from "react";
import { getSession } from 'next-auth/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { isLeagueStart, TIME_CUT_OFF } from "../utils/constants";
import GetLeaderBoardView from "../utils/GetLeaderBoardView"
import EmailLink from "../components/EmailLink"

export default function LeaderBoard({ session, leaderBoardData }){
    const startTimeDate = new Date(TIME_CUT_OFF);
    const email = session.user.email;
    const [expandedCards, setExpandedCards] = useState({});

    // Helper function to normalize color values (add # prefix if missing)
    const normalizeColor = (color) => {
        if (!color || color === 'transparent' || color === 'inherit') {
            return color;
        }
        return color.startsWith('#') ? color : `#${color}`;
    };

    // Sort leaderBoardData by total_points descending
    const sortedData = [...(leaderBoardData || [])].sort((a, b) => {
        const pointsA = parseInt(a.total_points) || 0;
        const pointsB = parseInt(b.total_points) || 0;
        return pointsB - pointsA;
    });

    const handleExpandClick = (index) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

  return(
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}> 
      <h1> Leader Board </h1>
      {!isLeagueStart() && (
        <h2> *** Leader Board available after {startTimeDate.toLocaleString()} ***</h2>
      )}
      {isLeagueStart() && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3, paddingBottom: 1 }}>
          {sortedData.map((entry, index) => {
            const isExpanded = expandedCards[index] || false;
            return (
              <Card 
                key={index} 
                sx={{ 
                  width: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
                onClick={() => handleExpandClick(index)}
              >
                <CardContent sx={{ marginBottom: -1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box onClick={(e) => e.stopPropagation()}>
                        <EmailLink email={entry.email} variant="h7" sx={{ fontWeight: 'bold' }} />
                      </Box>

                    </Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {entry.total_points} pts
                    </Typography>
                  </Box>
                  {!isExpanded && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {entry.remaining_players && entry.remaining_players.map((player, playerIndex) => {
                        const backgroundColor = normalizeColor(player.color) || '#000000';
                        const textColor = normalizeColor(player.alternateColor) || '#ffffff';
                        return (
                          <Box
                            key={playerIndex}
                            sx={{
                              backgroundColor: backgroundColor,
                              color: textColor,
                              padding: '8px 12px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                            }}
                          >
                            {player.position}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
                      {entry.remaining_players && entry.remaining_players.map((player, playerIndex) => {
                        const backgroundColor = normalizeColor(player.color) || '#000000';
                        const textColor = normalizeColor(player.alternateColor) || '#ffffff';
                        return (
                          <Box
                            key={playerIndex}
                            sx={{
                              backgroundColor: backgroundColor,
                              color: textColor,
                              padding: '8px 12px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              width: '100%',
                            }}
                          >
                            {player.name}
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                  <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 1, marginBottom: -1 }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandClick(index);
                      }}
                      size="small"
                      sx={{ padding: '1px' }}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </div>
  );
};

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);

  if (!isLeagueStart()) {
    return {
      props: {
        session: sessionUser,
        leaderBoardData: [],
      },
    };
  }

  let leaderBoardData = [];
  try {
    const { default: redisClient } = await import('../lib/redisClient');
    // const cache = await redisClient.get('detailed-league-view')
    // if (!cache) {
      leaderBoardData = await GetLeaderBoardView();
      // console.log('cache miss')
      // redisClient.set('leader-board-view', JSON.stringify(leaderBoardData));
      // redisClient.expire('leader-board-view', 60 * 60 * 3); // 3 hours
    } catch (err) {
    console.log(`server side error in leader-board-view: ${err}`);
  }

  return {
    props: {
      session: sessionUser,
      leaderBoardData,
    },
  };
}