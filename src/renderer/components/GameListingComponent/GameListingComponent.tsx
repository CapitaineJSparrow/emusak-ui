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
import defaultIcon from '../../resources/default_icon.jpg';

interface IEmulatorContainer {
  config: EmusakEmulatorConfig;
}

const Label = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  border: '1px solid black',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 8px',
  color: '#FFF',
  zIndex: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
  textAlign: 'center'
}));

const GameListingComponent = ({ config }: IEmulatorContainer) => {
  const { t } = useTranslation();
  const [getModeForBinary, currentEmu] = useStore(s => [s.getModeForBinary, s.currentEmu]);
  const [mode, setMode] = useState<EmusakEmulatorMode>(null);
  const [games, setGames] = useState<{ title: string, img: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredGames, setFilteredGames] = useState<typeof games>([]);

  // 1. Detect if emulator is global, portable or using fitgirl
  // 2. Scan games on user system
  // 3. Build metadata from eshop with titleId as argument
  const createLibrary = async () => {
    const m = await getModeForBinary(config.path);
    const titleIds = await ipcRenderer.invoke('scan-games', m.dataPath, currentEmu);
    const gamesCollection: { title: string, img: string }[]  = await Promise.all(titleIds.map(async (i: string) => ipcRenderer.invoke('build-metadata-from-titleId', i)));
    setGames(gamesCollection.filter(i => i.title !== '0000000000000000')); // Homebrew app

    setIsLoaded(true);
    setMode(m);
  }

  useEffect(() => {
    createLibrary().catch(() => setIsLoaded(true));
  }, [config]);

  useEffect(() => {
    setFilteredGames(searchTerm.length > 0 ? games.filter(item => searchTerm.length > 0 ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : true) : games);
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
                  <Masonry columns={Math.min(Math.max(filteredGames.length, 4), 6)} spacing={4}>
                    {
                      filteredGames
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map((item, index) => (
                        <Stack key={index}>
                          <Label title={item.title}>{item.title}</Label>
                          <img
                            referrerPolicy="no-referrer"
                            src={item.img.length > 0 ? item.img : defaultIcon}
                            alt={item.title}
                            loading="lazy"
                            data-name={item.title}
                            style={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}
                          />
                        </Stack>
                      ))
                    }
                    {
                      filteredGames.length <= 3 && (
                        <>
                          <Stack><p>&nbsp;</p></Stack>
                          <Stack><p>&nbsp;</p></Stack>
                          <Stack><p>&nbsp;</p></Stack>
                        </>
                      )
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
                    <h4 dangerouslySetInnerHTML={{ __html: currentEmu === "ryu" ? t('launchRyujinx') : t('launchYuzu') }} />
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
