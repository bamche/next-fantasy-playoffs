// import NextAuth from 'next-auth';
// import EmailProvider from 'next-auth/providers/email';
// import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
// import clientPromise from '../../../lib/mongodb'

// export default NextAuth({
//   providers: [
//     // Passwordless / email sign in
//     EmailProvider({
//       server: process.env.EMAIL_SERVER,
//       // {
//       //   host: process.env.SENDGRID_SERVER,
//       //   port: process.env.SENDGRID_PORT_TLS,
//       //   auth: {
//       //     user: process.env.SENDGRID_USERNAME,
//       //     pass: process.env.SENDGRID_PASSWORD,
//       //   },
//       // },
//       from: `Blake Myrick <${process.env.SENDGRID_FROM}>`,
//     }),
//   ],
//   secret: 'lTkFKhGAM8lnnIFMK0IsLsMCDMSaL61139+HrkqDQYs=',
//   adapter: MongoDBAdapter(clientPromise),
// });

import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { FirebaseAdapter } from '@next-auth/firebase-adapter';

import firebase from '../../../firebase/clientApp';

const firestore = firebase.firestore();

export default NextAuth({
  providers: [
    // Passwordless / email sign in
    Providers.Email({
      server: {
        host: process.env.SENDGRID_SERVER,
        port: process.env.SENDGRID_PORT_TLS,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      },
      from: `Blake Myrick <${process.env.SENDGRID_FROM}>`,
    }),
  ],
  adapter: FirebaseAdapter(firestore),
});

