import React, { Fragment, useEffect } from 'react';
import { SessionProvider } from "next-auth/react"
import { useRouter } from 'next/router';
// import PropTypes from 'prop-types';
import Head from 'next/head';

// Stying imports
// import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';



function MyApp(props) {
  const router = useRouter();
  const { Component, pageProps } = props;
  
  return (
    <Fragment>
      <Head>
        <title>NFL Fantasy Playoffs</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      {/* <ThemeProvider theme={theme}> */}
        <SessionProvider session={pageProps.session}>
          <AppBar position="relative">
            <Toolbar>
              <Typography variant="h6" color="inherit" noWrap>
                NFL Playoff Challenge
              </Typography>
            </Toolbar>
          </AppBar>     
          <CssBaseline />
          <Component {...pageProps} />
        </SessionProvider>
        
      {/* </ThemeProvider> */}
    </Fragment>
  );
}

export default MyApp;
