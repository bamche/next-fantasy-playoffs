import React, { useState } from 'react';
import axios from "axios";
import { useRouter } from 'next/router';

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

function Login({setTeamName, setName}){
    const classes = useStyles();

      //state to store input field values
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
   
    async function onSubmit(e) {
        e.preventDefault();
        
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        const handleLogin = await axios.post('/login', null, {headers,params:{email:e.target[0].value, password:e.target[1].value}})
        const {name, teamName, email, isLoggedIn:loggedInStatus } = handleLogin.data
        if(loggedInStatus){
            setEmail(email);
            setTeamName(teamName);
            setName(name);
            setLoggedIn(loggedInStatus);
            
        }; 
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
                    <form className={classes.form} noValidate onSubmit={onSubmit}>
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
                       
                        <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        >
                        Sign In
                        </Button>
                        <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                            Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/signup" variant="body2" >
                            {"Don't have an account? Sign Up"}
                            </Link>
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

        // <div className="App">
        //   <h1>NFL Playoff Challenge</h1>
        //   <div id="login-form">
        //       <div className="form-floating" id="form-floating" >
        //           <form method={'POST'} onSubmit={onSubmit} className="form-control" id="form-control" >
        //               <input name="email" type="text" placeholder="email" className="form-control"></input>
        //               <input name="password" type="password" placeholder="password" className="form-control"></input>
        //               <div className="d-grid gap-2 ">
        //                   <input type='submit' value="login" id="login-button" className="btn btn-primary"></input>
        //                   {/* <Link to="/Signup" className="btn btn-secondary"><button className="btn btn-secondary" id="signup-button" type="button" >new account</button></Link> */}
                          
        //               </div>
        //           </form>
        
        //       </div>
        //   </div>
        //   {/* <Link to="/AdminQuery" className="btn btn-secondary"><button className="btn btn-secondary" id="admin-query-button" type="button" >admin</button></Link>
        //   <Link to="/team-builder" className="btn btn-secondary"><button className="btn btn-secondary" id="team-builder-button" type="button" >Team Builder</button></Link> */}
        // </div>
    );
};

export default Login;