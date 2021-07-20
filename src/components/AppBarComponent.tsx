import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@material-ui/core";
import electron from "electron";
import discord_logo from "../assets/discord_logo.png";
import ryujinx_logo from "../assets/ryujinx_logo.png";
import yuzu_logo from "../assets/yuzu_logo.png";
import * as React from "react";

interface IAppBarComponentProps {
  tab: 'yuzu' | 'ryu';
  onTabChange: (tab: 'yuzu' | 'ryu') => void;
}

const AppBarComponent = ({ tab, onTabChange }: IAppBarComponentProps) =>  (
  <AppBar position="static">
    <Toolbar style={{ display: 'flex', justifyContent: "space-between" }}>
      <Typography variant="h6" style={{ flex: '0 0 100px' }}>
        EmuSAK
      </Typography>
      <Box style={{ display: 'flex' }}>
        <Box style={{ flex: '0 0 100px', marginRight: 16 }}>
          <Button
            startIcon={(<img height={30} src={ryujinx_logo} alt=""/>)}
            variant={tab === 'ryu' ? 'outlined': 'text'}
            onClick={() => onTabChange('ryu')}
          >
            Ryujinx
          </Button>
        </Box>
        <Box style={{ flex: '0 0 100px' }}>
          <Button
            startIcon={(<img height={30} src={yuzu_logo} alt=""/>)}
            variant={tab === 'yuzu' ? 'outlined': 'text'}
            onClick={() => onTabChange('yuzu')}
          >
            Yuzu
          </Button>
        </Box>
      </Box>
      <Box style={{ flex: '0 0 50px' }}>
        <IconButton
          onClick={() => electron.shell.openExternal("https://discord.gg/nKstg6x")}
          edge="start"
          color="inherit"
        >
          <img height={30} src={discord_logo} alt=""/>
        </IconButton>
      </Box>
    </Toolbar>
  </AppBar>
);

export default AppBarComponent;
