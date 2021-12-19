import React, { useState } from 'react';
import axios from "axios";
import { useRouter } from 'next/router';
import { getCsrfToken } from "next-auth/react"

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import Container from '@mui/material/Container';

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

function Signup({ csrfToken }) {

    const classes = useStyles();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [validatePassword, setValidatePassword] = useState('');
    const router = useRouter();
   

    const handleSignup = async () => {
       console.log(email, name)         
       console.log('csrf', csrfToken)      
       await axios.post('/api/auth/signin/email', { email, csrfToken })
        
        
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
                                Create Account
                            </Typography>
                            <div className={classes.form} >
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
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
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="Name"
                                    label="Name"
                                    name="name"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="validatePassword"
                                    label="Re-Enter Password"
                                    type="password"
                                    id="validatePassword"
                                    value={validatePassword}
                                    onChange={(e) => {
                                        setValidatePassword(e.target.value);
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
                                <Grid item xs>
                                    
                                </Grid>
                                <Grid item>
                                    <Link href="/" variant="body2" >
                                    {"Already have an account? Sign in"}
                                    </Link>
                                </Grid>
                                </Grid>
                            </div>

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


        // <div className="App">
        //   <h1>Create Account</h1>
        //   <div id="login-form">
        //       <div class="form-floating"  >
        //           <form method={'POST'} onSubmit={onSubmit} class="form-control" id="signup-form">
        //               <input name="username" type="text" placeholder="email" class="form-control"></input>
        //               <input name="name" type="text" placeholder="name" class="form-control"></input>
        //               <input name="team-name" type="text" placeholder="team name" class="form-control"></input>
        //               <input name="password" type="password" placeholder="password" class="form-control"></input>
        //               <input name="retype-password" type="password" placeholder="retype password" class="form-control"></input>
        //               <div class="d-grid gap-2 ">
        //                   <input type='submit' value="submit" id="login-button" class="btn btn-primary"></input>
                          
        //               </div>
        //           </form>
        
        //       </div>
        //   </div>
        // </div>
    );
};

export default Signup;

export async function getServerSideProps(context) {
    const csrfToken = await getCsrfToken(context);
  
    return {
      props: { csrfToken },
    };
  }