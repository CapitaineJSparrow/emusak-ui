import { AppBar, Box, IconButton, Toolbar, Typography } from "@material-ui/core";
import electron from "electron";
// @ts-ignore
import discord_logo from "../assets/discord_logo.png";
import * as React from "react";


const AppBarComponent = () =>  (
  <AppBar position="static">
    <Toolbar style={{ display: 'flex' }}>
      <Typography variant="h6" style={{ flex: 1 }}>
        EmuSAK
      </Typography>
      <Box style={{ flex: '0 0 50px' }}>
        <IconButton onClick={() => electron.shell.openExternal("https://discord.gg/nKstg6x")} edge="start" color="inherit" aria-label="menu">
          <img height={30} src={discord_logo} alt=""/>
        </IconButton>
      </Box>
    </Toolbar>
  </AppBar>
);

export default AppBarComponent;
