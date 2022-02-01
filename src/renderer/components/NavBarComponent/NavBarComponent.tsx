import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useTranslation from "../../i18n/I18nService";
import discord_logo from "../../resources/discord_logo.png";
import ryu_logo from "../../resources/ryujinx_logo.png";
import yuzu_logo from "../../resources/yuzu_logo.png";
import { Button, IconButton, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import useStore from "../../actions/state";
import { LS_KEYS } from "../../../types";

const NavBarComponent = () => {
  const { t } = useTranslation();
  const [currentEmu, switchEmuAction] = useStore(s => [s.currentEmu, s.switchEmuAction]);
  const locale = localStorage.getItem(LS_KEYS.LOCALE) ?? "en";

  const onLocaleSelectChange = (e: SelectChangeEvent<string>) => {
    localStorage.setItem(LS_KEYS.LOCALE, e.target.value);
    window.location.reload();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar enableColorOnDark color="primary" position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{ flex: "0 0 90px" }}>
            <b>{ t("emusak") }</b>
          </Typography>
          <div style={{ flex: 1 }}>
            <Box style={{ margin: "0 auto", width: 250 }}>
              <Button
                onClick={() => switchEmuAction("ryu")}
                startIcon={(<img src={ryu_logo} alt="ryujinx" height={30} />)}
                variant="outlined"
                color="success"
                style={{ color: "#FFF", marginRight: 16, border: currentEmu === "ryu" ? "2px solid #EEE" : "2px solid transparent" }}
              >
                Ryujinx
              </Button>
              <Button
                onClick={() => switchEmuAction("yuzu")}
                startIcon={(<img src={yuzu_logo} alt="ryujinx" height={30} />)}
                variant="text"
                color="success"
                style={{ color: "#FFF", border: currentEmu === "yuzu" ? "2px solid #EEE" : "2px solid transparent" }}
              >
                Yuzu
              </Button>
            </Box>
          </div>
          <Box style={{ flex: "0 0 120px" }}>
            <Select
              value={locale}
              label="Age"
              onChange={onLocaleSelectChange}
              variant="standard"
            >
              <MenuItem value={"en"}>EN</MenuItem>
              <MenuItem value={"ru"}>RU</MenuItem>
            </Select>
          </Box>
          <Box style={{ flex: "0 0 50px" }}>
            <a href="https://discord.gg/nKstg6x" className="no-blank-icon" target="_blank">
              <IconButton
                edge="start"
                color="inherit"
              >
                <img height={40} src={discord_logo} alt=""/>
              </IconButton>
            </a>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBarComponent;
