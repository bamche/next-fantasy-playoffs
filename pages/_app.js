import React, { Fragment, useEffect } from 'react';
// import { Provider } from 'next-auth/client';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
// import PropTypes from 'prop-types';
import Head from 'next/head';

// Stying imports
// import { ThemeProvider } from '@material-ui/core/styles';
// import CssBaseline from '@material-ui/core/CssBaseline';


function MyApp(props) {
  const router = useRouter();
  const { Component, pageProps } = props;
  const pathsToExcludeHeaderFooter = ['/signin'];
  const showHeaderFooter = !pathsToExcludeHeaderFooter.includes(router.pathname);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <Fragment>
      <Head>
        <title>NFL Fantasy Playoffs</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      {/* <ThemeProvider theme={theme}> */}
        {/* <Provider session={pageProps.session}> */}
            {showHeaderFooter && (
              <Layout>
                
                  {/* <CssBaseline /> */}
                  <Component {...pageProps} />
                
              </Layout>
            )}
            {!showHeaderFooter && <Component {...pageProps} />}
          {/* </Provider> */}
        
      {/* </ThemeProvider> */}
    </Fragment>
  );
}

// MyApp.propTypes = {
//   Component: PropTypes.elementType.isRequired,
//   pageProps: PropTypes.object.isRequired,
// };

export default MyApp;
