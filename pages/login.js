import React, { useState } from 'react';
import axios from "axios";


import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import Container from '@mui/material/Container';
import { getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/router';

const useStyles = makeStyles({
    card: {
        padding: '5%',
      },
    paper: {
      marginTop: '10%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    
    form: {
      width: '100%',
    },
    submit: {
    },
   
  });

export default function Login({ csrfToken }){
    const classes = useStyles();
      //state to store input field values
    const [email, setEmail] = useState('');
    const router = useRouter();

    const handleSignup = async () => {
        console.log(email);
        console.log('csrf', csrfToken);
        router.push(`/api/auth/signin`);
    };
     
    return (

        <Container component="main" maxWidth="xs">
            
            <Box mt={3}>
                <Card classsName={classes.card}>
                <Box p={3}>
                    <CssBaseline />
                    <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        {/* <HouseIcon /> */}
                    </Avatar>
                    
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form className={classes.form} noValidate >
                        <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                        />
                                         
                        <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={handleSignup}
                        >
                        Sign In
                        </Button>
                        <Grid container>
                      
                        <Grid item>
                            Send a login link to your email
                        </Grid>
                        </Grid>
                    </form>

                    <Typography
                        component="h3"
                        variant="h5"
                        className={classes.submit}
                    >
                        <Divider />
                    </Typography>
                    </div>
                </Box>
                </Card>
            </Box>
        </Container>

    );
};

export async function getServerSideProps(context) {
  const csrfToken = await getCsrfToken(context);

  return {
    props: { csrfToken },
  };
}