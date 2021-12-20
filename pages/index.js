import Login from '../components/Login';
import TeamView from '../components/TeamView';
import { getSession } from 'next-auth/react';

export default function Home({ session }) {
  if(!session) return <Login session={session} />
  else return <TeamView session={session} />
}

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);

  return {
    props: {
      session: sessionUser,
    },
  };
}
