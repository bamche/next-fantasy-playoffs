import React from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

 const PlayerColumn = ({teamSelection,removePlayer}) => {
    const positionArray = ['qb', 'rb1', 'rb2', 'wr1', 'wr2', 'te', 'flex1', 'flex2', 'flex3', 'flex4', 'k', 'dst']

    // Helper function to normalize color values (add # prefix if missing)
    const normalizeColor = (color) => {
        if (!color || color === 'transparent' || color === 'inherit') {
            return color;
        }
        // If color doesn't start with #, add it
        return color.startsWith('#') ? color : `#${color}`;
    };

    const populatedColumn = positionArray.map((ele, index) => {
        const playerData = teamSelection[ele];
        const playerId = playerData[0];
        const playerText = playerData[1];
        const backgroundColor = normalizeColor(playerData[2]) || 'transparent';
        const textColor = normalizeColor(playerData[3]) || 'inherit';

        return (
            <ListItem 
                id={ele} 
                key={playerId || index}
                playerid={playerId || index}
                onClick={removePlayer}
                sx={{
                    backgroundColor: backgroundColor,
                    color: textColor,
                    '&:hover': {
                        backgroundColor: backgroundColor === 'transparent' ? 'action.hover' : backgroundColor,
                        opacity: 0.8
                    }
                }}
            >
                {playerText}
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
