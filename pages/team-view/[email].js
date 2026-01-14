import React from "react";
import { getSession } from 'next-auth/react';
import TeamView from "../../components/TeamView"
import GetTeamView from "../../utils/GetTeamView"

export default function TeamViewPage({ email, teamViewStats, error }){

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return(
   <TeamView email={email} teamViewStats={teamViewStats} />
  );
};

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);
  const { email: emailParam } = context.params;
  
  // Decode the email parameter (handles URL encoding)
  const decodedEmail = decodeURIComponent(emailParam);

  let teamViewStats = null;
  let error = null;

  try {
    const teamViewData = await GetTeamView(decodedEmail);
    
    if (teamViewData && teamViewData.length > 0 && teamViewData[0].teamviewstats) {
      teamViewStats = [
        ...teamViewData[0].teamviewstats.players, 
        { 
          name: "Total Team Score", 
          id: 12, 
          total_score: teamViewData[0].teamviewstats.total_score 
        }
      ];
    } else {
      error = "No team found for this user.";
    }
  } catch (err) {
    console.log(`server side error in team-view: ${err}`);
    error = "Error loading team view data.";
  }

  return {
    props: {
      session: sessionUser,
      email: decodedEmail,
      teamViewStats,
      error,
    },
  };
}

