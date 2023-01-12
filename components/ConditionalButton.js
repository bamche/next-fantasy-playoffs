import React from "react";
import Button from '@mui/material/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function ConditionalButon ({submitTeam, waitingResponse }) {

    if (waitingResponse) {
        return  <CircularProgress />
    } else {
        return <Button size="small" variant="contained" onClick={submitTeam}>Submit Team</Button> 
    }
}