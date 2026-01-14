import React from "react";
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Admin({ session }) {
  const router = useRouter();
  
  if (session.user.email != process.env.NEXT_PUBLIC_ADMIN) {
    throw new Error("Unauthorized to view this page");
  }

  return (
    <div className="App">
      <h1>Admin Panel</h1>
      <nav style={{ marginBottom: '2rem' }}>
        <Link href="/admin/gamestatupdates">
          <a style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Game Stat Updates
          </a>
        </Link>
        <Link href="/admin/notificationupdates">
          <a style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Notification Updates
          </a>
        </Link>
      </nav>
      <p>Select an admin function from above.</p>
    </div>
  );
}

export async function getServerSideProps(context) {
  const sessionUser = await getSession(context);

  return {
    props: {
      session: sessionUser,
    },
  };
}


