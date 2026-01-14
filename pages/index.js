import Login from '../components/Login';
import TeamView from '../components/TeamView';
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { getCsrfToken } from 'next-auth/react';

export default function Home({ session, csrfToken }) {
  if(!session) return <Login session={session} csrfToken={csrfToken}  />
  else return <TeamView email={session.user.email} />
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const csrfToken = await getCsrfToken(context);
  
  if (session?.user?.email) {
    return {
      redirect: {
        destination: '/team-view',
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
      csrfToken,
    },
  };
}
