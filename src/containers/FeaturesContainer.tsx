import React, { useEffect } from "react";
import { AppBar, Box, Button, Chip, Grid, IconButton, Tab, Tabs, TextField } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import ShadersListComponent from "../components/features/ShadersListComponent";
import { IEmusakEmulatorConfig, IEmusakMod, IEmusakSaves, IEmusakShaders, IRyujinxConfig } from "../types";
import { titleIdToName } from "../service/EshopDBService";
import SavesListComponent from "../components/features/SavesListComponent";
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Swal from "sweetalert2";
import ModsListComponent from "../components/features/ModsListComponent";
import OSQueryFactory from "../queries/OSQueryFactory";

interface IFeaturesContainerProps {
  config: IEmusakEmulatorConfig;
  onFirmwareDownload: () => void;
  onKeysDownload: () => void;
  onEmuConfigDelete?: (config: IRyujinxConfig) => void;
  firmwareVersion: string;
  emusakShaders: IEmusakShaders;
  onShadersDownload: (id: string) => void;
  emusakSaves: IEmusakSaves;
  onRefresh: Function;
  onPortableButtonClick?: Function;
  onSaveDownload: Function;
  onModsDownload: Function;
  onShareShaders: Function;
  emusakMods: IEmusakMod[];
  threshold: number;
  emulator: 'ryu' | 'yuzu';
  isValid: boolean;
}

const FeaturesContainer = ({
  config,
  onFirmwareDownload,
  onKeysDownload,
  firmwareVersion,
  emusakShaders,
  onShadersDownload,
  onEmuConfigDelete,
  emusakSaves,
  onPortableButtonClick,
  onRefresh,
  onSaveDownload,
  onModsDownload,
  emusakMods,
  onShareShaders,
  threshold,
  emulator,
  isValid
}: IFeaturesContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState(emulator === 'ryu' ? 0 : 2);
  const [filterTerm, setFilterTerm] = React.useState<string>(null);
  const [games, setGames] = React.useState([]);
  const amdWarningKey = 'amd-warning';

  /**
   * Since we receive only title IDs from emulator config, find real title name from different databases and sort list alphabetically
   */
  useEffect(() => {
    setGames(config
      .games
      .map(g => ({
        ...g,
        name: titleIdToName(g.id)
      }))
      .filter(g => {
        if (!filterTerm) {
          return g;
        }

        return g.name.toLowerCase().includes(filterTerm.toLowerCase())
      })
      .sort((a, b) => a.name.localeCompare(b.name))
    )
  }, [config, filterTerm]);

  // Warn user using without nvidia graphics cards that shaders are unstable on this vendor
  useEffect(() => {
    if(!localStorage.getItem(amdWarningKey) && emulator !== "yuzu") {
      OSQueryFactory
        .hasNvidiaGPU()
        .then(hasNvidiaGPU => {
          if (!hasNvidiaGPU && process.platform === "win32") {
            localStorage.setItem(amdWarningKey, 'true'); // Display warning only 1 time
            Swal.fire({
              icon: 'info',
              text: 'Emusak Shaders may not work on AMD graphics cards due to strange behavior with OpenGL x AMD on windows and can cause crash when you compile shaders on first run.'
            })
          }
        })
    }
  }, []);

  const renderTab = () => {
    switch (tabIndex) {
      case 0:
        return <ShadersListComponent
          emusakShaders={emusakShaders}
          games={games}
          onShadersDownload={(id) => onShadersDownload(id)}
          onShareShaders={onShareShaders}
          threshold={threshold}
        />;
      case 1:
        return <SavesListComponent
          games={games}
          onSaveDownload={(id: string, saveIndex: number, fileName: string) => onSaveDownload(id, saveIndex, fileName)}
          emusakSaves={emusakSaves}
        />;
      case 2:
        return <ModsListComponent
          games={games}
          emusakMods={emusakMods}
          onModsDownload={onModsDownload}
        />;
    }
  }

  const onSaveOrModSubmissionClick = () => {
    Swal.fire({
      icon: 'info',
      html: 'To submit a save or a mod, please join the discord server on top right then post it in <code style="white-space: nowrap">#switch-mods-saves</code> channel. Please specify game title and version.'
    })
  }

  return (
    <>
      <Grid container spacing={2} style={{display: 'flex', alignItems: 'center'}}>
        {
          (onEmuConfigDelete && !(emulator === "yuzu" && !config.isPortable))
            ? (
              (
                <Grid item xs={4}>
                  <Box display="flex" justifyContent="start" alignItems="center">
                    <h3 style={{lineHeight: '24px'}}>
                      <IconButton
                        size="small"
                        color="secondary"
                        component="span"
                        onClick={() => onEmuConfigDelete(config as any)}
                      >
                        <DeleteOutline/>
                      </IconButton>
                    </h3>
                    <h3><small>{config.path}</small></h3>
                  </Box>
                </Grid>
              )
            )
          : (
              <Grid item xs={4}>
                <Box display="flex" justifyContent="start" alignItems="center">
                  <h3><small>AppData/Roaming/yuzu</small></h3>
                </Box>
              </Grid>
            )
        }
        {
          !config.path && (
            <Grid item xs={3}>&nbsp;</Grid>
          )
        }
        <Grid item xs={3}>
          <Button
            onClick={() => onFirmwareDownload()}
            fullWidth
            variant="contained"
            color="primary"
            disabled={!firmwareVersion || !isValid}
          >
            Download firmware {firmwareVersion}
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            onClick={() => onKeysDownload()}
            fullWidth
            variant="contained"
            color="primary"
            disabled={!firmwareVersion || !isValid}
          >
            Download keys
          </Button>
        </Grid>
        {
          config.path && (

            <Grid item xs={3} style={{textAlign: 'right'}}>
              Is Portable
              <Chip
                label={config.isPortable ? 'yes' : 'no'}
                color="primary"
                style={{ marginLeft: 12 }}
              />
              {
                (onPortableButtonClick && !config.isPortable) && (
                  <Button
                    style={{ marginLeft: 12 }}
                    size="small"
                    color="primary"
                    variant="contained"
                    onClick={() => onPortableButtonClick()}
                  >
                    Make portable
                  </Button>
                )
              }
            </Grid>
          )
        }
      </Grid>

      <Box display="flex" alignItems="center">
        <Box marginRight={"12px"} style={{ position: 'relative', top: 8 }}>
          <IconButton
            size="small"
            onClick={() => onRefresh()}
            color="primary"
            aria-label="upload picture"
            component="span"
          >
            <AutorenewIcon />
          </IconButton>
        </Box>
        <Box minWidth={240}>
          <TextField
            onChange={e => setFilterTerm(e.target.value)}
            value={filterTerm || ''}
            label="Filter game list"
            type="search"
            fullWidth
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AppBar style={{marginTop: 20}} position="static">
            <Box display="flex" alignItems="center" justifyContent="space-between" paddingRight="12px">
              <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} aria-label="simple tabs example">
                <Tab wrapped={emulator === "yuzu"} disabled={emulator === "yuzu"} label={`OpenGL Shaders ${emulator === "yuzu" ? '(not ready yet)': ''}`} />
                <Tab label="Saves"/>
                <Tab label="Mods"/>
                { /** <Tab label="Watch updates"/> */}
              </Tabs>
              {
                tabIndex !== 0 && (
                  <Button
                    fullWidth={false}
                    variant="outlined"
                    onClick={onSaveOrModSubmissionClick}
                  >
                    How to submit a new {tabIndex == 1 ? 'save' : 'mod'} ?
                  </Button>
                )
              }
            </Box>
          </AppBar>

          { renderTab() }
        </Grid>
      </Grid>
    </>
  );
}

export default FeaturesContainer;
