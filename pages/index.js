import Login from '../components/Login';
import TeamView from '../components/TeamView';
import { getSession, getCsrfToken } from 'next-auth/react';

export default function Home({ session, csrfToken }) {
  if(!session) return <Login session={session} csrfToken={csrfToken}  />
  else return <TeamView email={session.user.email} />
}

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);  
  if (sessionUser?.user?.email) {
    return {
      redirect: {
        destination: '/team-view',
        permanent: false,
      },
    };
  }
  return {
    props: {
      session: sessionUser,
    },
  };
}
