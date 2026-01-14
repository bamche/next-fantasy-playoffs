import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Login from './Login';

export default function RequireAuth({ session, children }) {
  if (!session) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            You must be logged in to view this page
          </Typography>
          <Login/>
        </Box>
      </Container>
    );
  }

  return <>{children}</>;
}

