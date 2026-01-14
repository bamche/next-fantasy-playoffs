import React from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import TeamView from "../components/TeamView"
import GetTeamView from "../utils/GetTeamView"
import processGamesAutomatically from "../utils/processGamesAutomatically"

export default function TeamViewPage({ session, teamViewStats }){


  return(
   <TeamView email={session.user.email} teamViewStats={teamViewStats} />
  );
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  await processGamesAutomatically();

  let teamViewStats;
  try {

      const teamViewData = await GetTeamView(session.user.email);
      teamViewStats = [...teamViewData[0].teamviewstats.players, { name: "Total Team Score", id: 12, total_score: teamViewData[0].teamviewstats.total_score }];

  } catch (err) {
    console.log(`server side error in leader-board-view: ${err}`);
  }

  return {
    props: {
      session,
      teamViewStats,
    },
  };
}