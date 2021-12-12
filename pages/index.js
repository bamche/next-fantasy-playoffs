import Login from '../components/Login';
// import { getSession } from 'next-auth/client';

export default function Home({ session }) {
  return <Login session={session} />;
}

export async function getServerSideProps(context) {
  // const sessionUser = await getSession(context);

  return {
    props: {
      session: 'session'//sessionUser,
    },
  };
}
