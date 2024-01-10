import React, { Fragment } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
// import PropTypes from 'prop-types';
import Head from 'next/head';
import Drawer from '../components/Drawer'

// Stying imports
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function MyApp(props) {
  const router = useRouter();
  const { Component, pageProps } = props;
  pageProps.timeCutoff = '13 Jan 2024 21:31:00 GMT';
  
  return (
    <Fragment>
      <Head>
        <title>NFL Playoff Challenge</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
        <SessionProvider session={pageProps.session}>
          <AppBar position="relative">
            <Toolbar>
              <Drawer router={router} session={pageProps.session}/>
              
              <Typography variant="h6" color="inherit" noWrap>
                NFL Playoff Challenge
              </Typography>
            </Toolbar>
          </AppBar>     
          <CssBaseline />
          <Component {...pageProps} />
        </SessionProvider>
    </Fragment>
  );
}

export default MyApp;
