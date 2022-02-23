import React, { useEffect, useState } from "react";
import { GameBananaMod } from "../../types";
import { ipcRenderer } from "electron";
import { Alert, Box, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import useTranslation from "../i18n/I18nService";

const Label = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  border: "1px solid black",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 8px",
  color: "#FFF",
  zIndex: 1,
  lineHeight: 1.5,
  height: "3em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "block",
  textAlign: "center"
}));


const GameBanaCover = styled(Box)(() => ({
  width: "100%",
  aspectRatio: "16 / 9",
  background: "no-repeat center center",
  backgroundSize: "cover"
}));

type Props = {
  title?: string,
};

const GameBananaModsComponent = ({ title }: Props) => {
  const [gameBananaMods, setGameBananaMods] = useState<GameBananaMod[]>(null);
  const [ipcPending, setIpcPending] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (title) {
      ipcRenderer.invoke("search-gamebanana", title).then(d => {
        setGameBananaMods(d || []);
        setIpcPending(false);
      });
    }
  }, [title]);

  const renderModsList = () => (
    <Box pb={3}>
      {
        gameBananaMods.length === 0
          ? <Alert severity="info">{t("gamebananaNoMods")}</Alert>
          : <Grid container spacing={2}>
            {
              (gameBananaMods).map(mod => (
                <Grid key={mod.name} item xs={2}>
                  <Tooltip title={mod.name} placement="top">
                    <a style={{ textDecoration: "none", color: "#FFF" }} href={mod.url} className="no-blank-icon" target="_blank">
                      <Label title={mod.name}>{mod.name}</Label>
                      <GameBanaCover style={{ backgroundImage: `url(${ mod.cover })` }} />
                    </a>
                  </Tooltip>
                </Grid>
              ))
            }
          </Grid>
      }
    </Box>
  );

  return (
    <>
      <h3>{t("gamebananaModsTitle")}</h3>
      <Divider />
      <br />
      {
        (!ipcPending)
          ? renderModsList()
          : (
            <Box pt={16} style={{ position: "relative" }}>
              <div className="loader-container">
                <div className="lds-ripple">
                  <div></div>
                  <div></div>
                </div>
                <Typography variant="h6">{t("gameBananaLoading")}</Typography>
              </div>
            </Box>
          )
      }
    </>
  );
};

export default GameBananaModsComponent;
