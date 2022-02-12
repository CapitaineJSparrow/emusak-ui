import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import "./gameListing.css";
import { EmusakEmulatorConfig, EmusakEmulatorMode } from "../../../types";
import useStore from "../../actions/state";
import { Button, Chip, Divider, Grid, IconButton, TextField, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { ipcRenderer } from "electron";
import jackSober from "../../resources/jack_sober.png";
import defaultIcon from "../../resources/default_icon.jpg";
import useTranslation from "../../i18n/I18nService";
import RefreshIcon from "@mui/icons-material/Refresh";

interface IEmulatorContainer {
  config: EmusakEmulatorConfig;
  mode: EmusakEmulatorMode;
}

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
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "block",
  textAlign: "center"
}));

const GameListingComponent = ({ config, mode }: IEmulatorContainer) => {
  const { t } = useTranslation();
  const [currentEmu, setCurrentGameAction, openAlertAction] = useStore(s => [s.currentEmu, s.setCurrentGameAction, s.openAlertAction]);
  const [games, setGames] = useState<{ title: string, img: string, titleId: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredGames, setFilteredGames] = useState<typeof games>([]);

  // 1. Scan games on user system
  // 2. Build metadata from eshop with titleId as argument
  const createLibrary = async () => {
    const titleIds = await ipcRenderer.invoke("scan-games", mode.dataPath, currentEmu);
    const gamesCollection: { title: string, img: string, titleId: string }[]  = await Promise.all(titleIds.map(async (i: string) => ipcRenderer.invoke("build-metadata-from-titleId", i)));
    setGames(gamesCollection.filter(i => i.title !== "0000000000000000")); // Homebrew app
    setIsLoaded(true);
  };

  useEffect(() => {
    createLibrary().catch(() => setIsLoaded(true));
  }, [config, mode]);

  useEffect(() => {
    setFilteredGames(searchTerm.length > 0
      ? games.filter(item => searchTerm.length > 0 ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : true)
      : games);
  }, [games, searchTerm]);

  const refreshLibrary = () => {
    openAlertAction("info", t("refreshInfo"));
    return createLibrary();
  };

  return (
    <>
      {
        mode && (
          <Stack className="masonry" spacing={2}>
            <Grid container>
              <Grid item xs={8}>
                { t("mode") } <Chip color="primary" label={mode.mode} />
                &nbsp;
                <Tooltip placement="right" title={`${t("readingDataPath")} ${mode.dataPath}`}>
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={2} pr={2}>
                <Button onClick={refreshLibrary} startIcon={<RefreshIcon />} variant="outlined" fullWidth>{t("refresh")}</Button>
              </Grid>
              <Grid item xs={2}>
                <TextField onChange={e => setSearchTerm(e.target.value)} value={searchTerm} type="search" variant="standard" fullWidth placeholder={t("filter").replace("{{LENGTH}}", `${games.length}`)} />
              </Grid>
            </Grid>

            {
              (filteredGames.length > 0) && (
                <Grid container spacing={2} pr={4}>
                  {
                    filteredGames
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((item, index) =>(
                        <Grid item xs={2} onClick={() => setCurrentGameAction(item.titleId)} style={{ cursor: "pointer" }} key={index}>
                          <Label title={item.title}>{item.title}</Label>
                          <div
                            style={{ width: "100%", aspectRatio: "1 / 1" }}>
                            <img
                              referrerPolicy="no-referrer"
                              src={item.img.length > 0 ? item.img : defaultIcon}
                              alt={item.title}
                              loading="lazy"
                              data-name={item.title}
                              style={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4, width: "100%" }}
                            />
                          </div>
                        </Grid>
                      ))
                  }
                </Grid>
              )
            }

            {
              (isLoaded && games.length === 0) && (
                (
                  <div style={{ textAlign: "center", width: "50%", margin: "0 auto" }}>
                    <p>
                      <img width="100%" src={jackSober} alt=""/>
                    </p>
                    <Divider />
                    <h4 dangerouslySetInnerHTML={{ __html: currentEmu === "ryu" ? t("launchRyujinx") : t("launchYuzu") }} />
                  </div>
                )
              )
            }
          </Stack>
        )
      }
    </>
  );
};

export default GameListingComponent;
