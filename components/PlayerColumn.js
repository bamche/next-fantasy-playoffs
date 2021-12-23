import React from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

 const PlayerColumn = ({teamSelection,removePlayer}) => {
    const positionArray = ['qb', 'rb1', 'rb2', 'wr1', 'wr2', 'te', 'flex1', 'flex2', 'flex3', 'flex4', 'k', 'dst']

    const populatedColumn = positionArray.map((ele, index) => {
        return (
            <ListItem id={ele} 
                key={teamSelection[ele][0] || index}
                playerid={teamSelection[ele][0] || index}
                onClick={removePlayer}
            >
                {teamSelection[ele][1]}
            </ListItem>
        )
    });
    return(
        <List 
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        dense={true}
        >
            {populatedColumn}
        </List>
    );
};
export default PlayerColumn;
