import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '../../../lib/mongodb'

export default NextAuth({
  providers: [
    // Passwordless / email sign in
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      // {
      //   host: process.env.SENDGRID_SERVER,
      //   port: process.env.SENDGRID_PORT_TLS,
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // },
      from: `Blake Myrick <${process.env.SENDGRID_FROM}>`,
    }),
  ],
  secret: 'lTkFKhGAM8lnnIFMK0IsLsMCDMSaL61139+HrkqDQYs=',
  adapter: MongoDBAdapter(clientPromise),
});
