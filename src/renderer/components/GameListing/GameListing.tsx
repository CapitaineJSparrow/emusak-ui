import React, { useEffect, useState } from "react";
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import './gameListing.css'
import { EmusakEmulatorConfig, EmusakEmulatorMode } from "../../../types";
import useStore from "../../actions/state";
import { Chip, Grid, IconButton, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from "react-i18next";
import { ipcRenderer } from "electron";

interface IEmulatorContainer {
  config: EmusakEmulatorConfig;
}

const Label = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  border: '1px solid black',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 0',
  color: '#FFF'
}));

const GameListing = ({ config }: IEmulatorContainer) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<EmusakEmulatorMode>(null);
  const [getModeForBinary, currentEmu] = useStore(s => [s.getModeForBinary, s.currentEmu]);
  const [games, setGames] = useState<{ title: string, img: string }[]>([]);

  useEffect(() => {
    getModeForBinary(config.path).then(m => {
      setMode(m);
      ipcRenderer
        .invoke('scan-games', m.dataPath, currentEmu)
        .then(g => setGames(g.map((i: string) => ({ title: i, img: 'https://img-eshop.cdn.nintendo.net/i/16259342084f704aa52da956cf1b1a9c2ad1f88b3de6c3e263c350813e7ccd1f.jpg' }))));
    });
  }, []);

  return (
    <>
      {
        mode && (
          <Stack className="masonry" spacing={2}>
            <Grid container>
              <Grid item xs={12}>
                { t('mode') } <Chip color="primary" label={mode.mode} />
                &nbsp;
                <Tooltip placement="right" title={`${t('readingDataPath')} ${mode.dataPath}`}>
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            <Masonry columns={Math.min(Math.max(games.length, 3), 5)} spacing={4}>
              {games.map((item, index) => (
                <Stack key={index}>
                  <Label>{item.title.length > 29 ? `${item.title.slice(0, 29)}...` : item.title}</Label>
                  <img
                    referrerPolicy="no-referrer"
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    style={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}
                  />
                </Stack>
              ))}
              {
                // create an empty item to render nicely masonry in case there is < 3 items
                games.length < 3 && (<Stack><p>&nbsp;</p></Stack>)
              }
            </Masonry>
          </Stack>
        )
      }
    </>
  );
}

export default GameListing;
