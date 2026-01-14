import React from "react";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
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
        <Link href="/admin/game-stat-updates">
          <a style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Game Stat Updates
          </a>
        </Link>
        <Link href="/admin/notification-updates">
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
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
}


