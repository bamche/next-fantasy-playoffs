import NextAuth from 'next-auth';
import GoogleProvider from "next-auth/providers/google";

import firebase from '../../../firebase/clientApp';

const firestore = firebase.firestore();

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  adapter: FirebaseAdapter(firestore),
});

