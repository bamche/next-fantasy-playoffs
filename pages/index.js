import Login from '../components/Login';
import TeamView from '../components/TeamView';
import { getSession, getCsrfToken } from 'next-auth/react';

export default function Home({ session, csrfToken }) {
  if(!session) return <Login session={session} csrfToken={csrfToken}  />
  else return <TeamView session={session} />
}

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);
  // const csrfToken = await getCsrfToken(context);
  // console.log("CRSF TOKENNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN", csrfToken)
  
  
  return {
    props: {
      session: sessionUser,
      // csrfToken: csrfToken,
    },
  };
}
