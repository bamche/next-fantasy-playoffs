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

import Link from 'next/link'

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

function Login(){
    const classes = useStyles();
      //state to store input field values
    const [email, setEmail] = useState('');
        
    return (

        <Container component="main" maxWidth="xs">
            
            <Box mt={3}>
                <Card classsName={classes.card}>
                <Box p={3}>
                    <CssBaseline />
                    <div className={classes.paper}>
                                        
                    <Typography component="h1" variant="h5">
                        NFL Playoff Challenge 2022
                    </Typography>
                    <form className={classes.form} noValidate >
                    <Link href="/login">
                      <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                      >
                      redirect to sign in page
                      </Button>
                    </Link>                                         
                        <Grid container>
                      
                        
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

export default Login;
