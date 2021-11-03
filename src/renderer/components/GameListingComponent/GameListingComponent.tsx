import React, { useEffect, useState } from "react";
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import './gameListing.css'
import { EmusakEmulatorConfig, EmusakEmulatorMode } from "../../../types";
import useStore from "../../actions/state";
import { Chip, Divider, Grid, IconButton, TextField, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from "react-i18next";
import { ipcRenderer } from "electron";
import jackSober from '../../resources/jack_sober.png';

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
  color: '#FFF',
  zIndex: 1
}));

const GameListingComponent = ({ config }: IEmulatorContainer) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<EmusakEmulatorMode>(null);
  const [getModeForBinary, currentEmu] = useStore(s => [s.getModeForBinary, s.currentEmu]);
  const [games, setGames] = useState<{ title: string, img: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredGames, setFilteredGames] = useState<typeof games>([]);

  useEffect(() => {
    getModeForBinary(config.path).then(m => {
      setMode(m);
      ipcRenderer
        .invoke('scan-games', m.dataPath, currentEmu)
        .then(async g => {
          const gamesCollection: { title: string, img: string }[]  = await Promise.all(g.map(async (i: string) => ipcRenderer.invoke('build-metadata-from-titleId', i)));
          setGames(gamesCollection)
          setIsLoaded(true);
        })
        .catch(() => {
          setIsLoaded(true);
        });
    });
  }, [config]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setFilteredGames(games.filter(item => searchTerm.length > 0 ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : true))
    } else {
      setFilteredGames(games);
    }
  }, [games, searchTerm])

  return (
    <>
      {
        mode && (
          <Stack className="masonry" spacing={2}>
            <Grid container>
              <Grid item xs={10}>
                { t('mode') } <Chip color="primary" label={mode.mode} />
                &nbsp;
                <Tooltip placement="right" title={`${t('readingDataPath')} ${mode.dataPath}`}>
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={2}>
                <TextField onChange={e => setSearchTerm(e.target.value)} value={searchTerm} type="search" variant="standard" fullWidth placeholder={`Filter ${games.length} games`} />
              </Grid>
            </Grid>

            {
              (filteredGames.length > 0) && (
                  <Masonry columns={Math.min(Math.max(filteredGames.length, 4), 5)} spacing={4}>
                    {
                      filteredGames
                        .map((item, index) => (
                        <Stack key={index}>
                          <Label>{item.title.length > 26 ? `${item.title.slice(0, 26)}...` : item.title}</Label>
                          <img
                            referrerPolicy="no-referrer"
                            src={item.img}
                            alt={item.title}
                            loading="lazy"
                            data-name={item.title}
                            style={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4, minHeight: 214 }}
                          />
                        </Stack>
                      ))
                    }
                  </Masonry>
                )
            }

            {
              (isLoaded && games.length === 0) && (
                (
                  <div style={{ textAlign: 'center', width: '50%', margin: '0 auto' }}>
                    <p>
                      <img width="100%" src={jackSober} alt=""/>
                    </p>
                    <Divider />
                    <h4 dangerouslySetInnerHTML={{ __html: t('launchRyujinx') }} />
                  </div>
                )
              )
            }
          </Stack>
        )
      }
    </>
  );
}

export default GameListingComponent;
