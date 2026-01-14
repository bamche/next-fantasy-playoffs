import React from "react";
import { getSession } from 'next-auth/react';
import TeamView from "../components/TeamView"
import GetTeamView from "../utils/GetTeamView"
import processGamesAutomatically from "../utils/processGamesAutomatically"

export default function TeamViewPage({ session, teamViewStats }){


  return(
   <TeamView email={session.user.email} teamViewStats={teamViewStats} />
  );
};

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);
  await processGamesAutomatically();

  let teamViewStats;
  try {

      const teamViewData = await GetTeamView(sessionUser.user.email);
      teamViewStats = [...teamViewData[0].teamviewstats.players, { name: "Total Team Score", id: 12, total_score: teamViewData[0].teamviewstats.total_score }];

  } catch (err) {
    console.log(`server side error in leader-board-view: ${err}`);
  }

  return {
    props: {
      session: sessionUser,
      teamViewStats,
    },
  };
}