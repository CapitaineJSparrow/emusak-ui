import React, {useEffect, useState} from "react";
import {
  AppBar, Backdrop, Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  makeStyles,
  Modal, Tab, Tabs,
  TextField, Typography
} from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Swal from 'sweetalert2';

import {
  countShaderForGame,
  downloadFirmwareWithProgress,
  downloadInfo,
  downloadKeys, downloadShaders,
  IryujinxLocalShaderConfig,
  readGameList, shareShader
} from "../../../service/ryujinx";
import eshopData from "../../../assets/test.json";
import { IRyujinxConfig } from "../../../model/RyujinxModel";
import {
  IEmusakMods,
  IEmusakSaves,
  IEmusakShadersCount
} from "../../../api/emusak";
import { DeleteOutline } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import ShadersList from "./gamelist/ShadersList";
import SaveList from "./gamelist/SaveList";
import ModsList from "./gamelist/ModsList";

interface IRyuGameListProps {
  config: IRyujinxConfig;
  onConfigDelete: Function;
  threshold: number;
  customDatabase: any;
  emusakShadersCount: IEmusakShadersCount;
  emusakSaves: IEmusakSaves;
  emusakFirmwareVersion: string;
  emusakMods: IEmusakMods;
}

const useStyles = makeStyles((theme) => ({
  modal: {
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: 20,
    width: '50%'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}



const RyuGameList = ({ config, onConfigDelete, threshold, customDatabase, emusakShadersCount, emusakSaves, emusakFirmwareVersion, emusakMods }: IRyuGameListProps) => {
  const classes = useStyles();
  const [currentGame, setCurrentGame] = useState('');
  const [games, setGames]: [string[], Function] = useState([]);
  const [gamesData]: [{id: string, title: string}[], Function] = useState(eshopData);
  const [localShadersCount, setLocalShadersCount]: [IryujinxLocalShaderConfig[], Function] = useState([]);
  const [filter, setFilter]: [string|null, Function] = useState(null);
  const [tabIndex, setTabIndex] = React.useState(0);
  const [ryujinxLogsModalOpen, setRyujinxLogsModalOpen] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);

  const [modalOpen, setModalOpen]: [boolean, Function] = React.useState(false);
  const [progressValue, setProgressValue]: [number, Function] = React.useState(0);

  const initPage = () => {
    readGameList(config).then(g => setGames(g));
  }

  /**
   * @constructor
   * On page load, fetch emusak shaders count and local game library
   */
  useEffect(() => {
    initPage();
  }, []);

  /**
   * When game library is updated, get local shaders count for each games if exists
   */
  useEffect(() => {
    if (games.length > 0) {
      Promise
        .all(games.map(titleID => countShaderForGame(config, titleID)))
        .then(counters => setLocalShadersCount(counters));
    }
  }, [games])

  const extractNameFromID = (id: string) => {
    const gameData = eshopData.find(d => d.id.toLowerCase().includes(id.toLowerCase()))
    return (customDatabase as ({ [key: string]: string}))[id.toUpperCase()] || (gameData?.title || id)
  }

  const extractLocalShaderCount = (titleID: string): number => {
    const counter = localShadersCount.find((counter: any) => counter.titleID === titleID);
    return counter && counter.count > 0 ? counter.count : 0;
  }

  const triggerFirmwareDownload = () => {
    setModalOpen(true);
    setProgressValue(0);
    downloadFirmwareWithProgress((p: number) => {
      if (p !== progressValue) {
        setProgressValue(p)
      }

      if (p >= 100) {
        // Download finished
        setModalOpen(false)
        setProgressValue(0);
      }
    })
  }

  const triggerShadersDownload = async (titleID: string, shadersCount: number) => {
    if (shadersCount > 0) {
      const { value } = await Swal.fire({
        title: 'Are you sure ?',
        text: 'Emusak will replace your previous shaders and you will not be able to retrieve them',
        showCancelButton: true,
        confirmButtonText: `Save`,
      });

      if (!value) {
        return false;
      }
    }

    setModalOpen(true);
    setProgressValue(0);
    await downloadInfo(config, titleID)

    await downloadShaders(config, titleID, (p: number) => {
      if (p !== progressValue) {
        setProgressValue(p)
      }

      if (p >= 100) {
        // Download finished
        setModalOpen(false)
        setProgressValue(0);
      }
    })

    initPage();
    await Swal.fire({
      icon: 'success',
      text: 'Successfully downloaded shaders'
    });
  }

  const handleTabChange = (event: any, newValue: any) => {
    setTabIndex(newValue);
  };

  const displayTable = (
    games: string[],
    extractNameFromID: Function,
    extractLocalShaderCount: Function,
    emusakShadersCount: IEmusakShadersCount,
    filter: string,
    config: IRyujinxConfig,
    triggerShadersDownload: Function,
    threshold: number,
    onShareShaderButtonClick: Function
  ) => {
    switch (tabIndex) {
      case 1:
        return <SaveList
          games={games}
          extractNameFromID={extractNameFromID}
          extractLocalShaderCount={extractLocalShaderCount}
          emusakShadersCount={emusakShadersCount}
          filter={filter}
          config={config}
          triggerShadersDownload={triggerShadersDownload}
          emusakSaves={emusakSaves}
        />
      case 2:
        return <ModsList
          games={games}
          extractNameFromID={extractNameFromID}
          emusakMods={emusakMods}
          config={config}
          filter={filter}
        />
      default:
        return <ShadersList
          games={games}
          extractNameFromID={extractNameFromID}
          extractLocalShaderCount={extractLocalShaderCount}
          emusakShadersCount={emusakShadersCount}
          filter={filter}
          config={config}
          triggerShadersDownload={triggerShadersDownload}
          threshold={threshold}
          onShareShaderButtonClick={onShareShaderButtonClick}
        />
    }
  }

  const onShareShaderButtonClick = (config: IRyujinxConfig, titleId: string, name: string, localShadersCount: number, emusakCount: number) => {
    setCurrentGame(name);
    shareShader(
      config,
      titleId,
      name,
      localShadersCount,
      emusakCount,
      () => setRyujinxLogsModalOpen(true),
      () => {
        setRyujinxLogsModalOpen(false);
        setBackdropOpen(true);
      },
      () => setBackdropOpen(false),
    );
  }

  return (
    <>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        disableBackdropClick
      >
        <div className={classes.modal}>
          <h2 id="simple-modal-title">Downloading ...</h2>
          <br />
          <LinearProgress variant="buffer" value={progressValue} valueBuffer={0} />
        </div>
      </Modal>

      <Backdrop className={classes.backdrop} open={backdropOpen} onClick={() => {}}>
        <CircularProgress color="secondary" /> <br />
        <h3>&nbsp; Upload shaders to anonfiles, This can take up to few minutes, depending on shader size and anonfiles load</h3>
      </Backdrop>

      <Modal
        open={ryujinxLogsModalOpen}
        onClose={() => {}}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.modal}>
          <h2 style={{textAlign: 'center', fontWeight: 'normal'}}>Please run <b>{currentGame}</b> in Ryujinx !</h2>

          <ul style={{listStyle: 'none'}}>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span> <CircularProgress color="secondary" size={30} /></span>
              &nbsp;
              &nbsp;
              <span> Waiting for <b>{currentGame}</b> to be run in ryujinx</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span> <CircularProgress color="secondary" size={30} /></span>
              &nbsp;
              &nbsp;
              <span> Waiting for shaders to be compiled</span>
            </li>
          </ul>
        </div>
      </Modal>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <h3 style={{ lineHeight: '36px' }} key={config.path}>
            <IconButton
              size="small"
              color="secondary"
              component="span"
              onClick={() => onConfigDelete(config)}
            >
              <DeleteOutline />
            </IconButton>
            &nbsp;
            <small>{config.path}</small>
          </h3>
        </Grid>
        <Grid item xs={3}>
          <Button
            onClick={() => triggerFirmwareDownload()}
            color="primary"
            variant="contained"
            fullWidth
            disabled={!emusakFirmwareVersion}
          >
            Download firmware {emusakFirmwareVersion}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button disabled={!emusakFirmwareVersion} onClick={() => downloadKeys(config)} color="primary" variant="contained" fullWidth>Download keys</Button>
        </Grid>
        <Grid item xs={2}>
          <span style={{ lineHeight: '36px', textAlign: 'right', display: 'block' }}>Is portable : <Chip label={config.isPortable ? 'yes': 'no'} color="primary" /></span>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={3}>
          <TextField onChange={e => setFilter(e.target.value)} fullWidth placeholder="Filter games" />
        </Grid>
      </Grid>
      <br/>

      <AppBar position="static">
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="simple tabs example">
          <Tab label="Shaders" />
          <Tab label="Saves" />
          <Tab label="Mods" />
        </Tabs>
      </AppBar>
      <TabPanel value={`${tabIndex}`}>
        Shaders
      </TabPanel>
      <TabPanel value={`${tabIndex}`}>
        Saves
      </TabPanel>
      <TabPanel value={`${tabIndex}`}>
        Mods
      </TabPanel>

      <Grid container style={{ margin: '0 0 20px 0' }}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: tabIndex === 0 ? 495 : undefined }}>Games ({games.length})</TableCell>
                  {
                    tabIndex === 0 && (
                      <>
                        <TableCell>EmuSAK Shaders count</TableCell>
                        <TableCell>Local Shaders count</TableCell>
                      </>
                    )
                  }
                  <TableCell style={{ width: tabIndex === 0 ? 380 : 190 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              {
                (gamesData.length > 0 && emusakShadersCount) && displayTable(
                  games,
                  extractNameFromID,
                  extractLocalShaderCount,
                  emusakShadersCount,
                  filter,
                  config,
                  triggerShadersDownload,
                  threshold,
                  onShareShaderButtonClick
                )
              }
            </Table>
          </TableContainer>
          {
            (!emusakShadersCount || !emusakFirmwareVersion || !emusakSaves) && (
              <div style={{ textAlign: 'center' }}>
                <br />
                <h4>Loading data from emusak, if it does not load something is maybe wrong with your network or emusak is temporary offline</h4>
                <br />
                <CircularProgress />
              </div>
            )
          }
        </Grid>
      </Grid>
    </>
  );
}

export default RyuGameList;
