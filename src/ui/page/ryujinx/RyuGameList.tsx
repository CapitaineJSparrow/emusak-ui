import React, {useEffect, useState} from "react";
import {Button, Chip, Grid, LinearProgress, makeStyles, Modal} from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
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
  readGameList
} from "../../../service/ryujinx";
import eshopData from "../../../assets/test.json";
import custom_database from "../../../assets/custom_database.json"
import { IRyujinxConfig } from "../../../model/RyujinxModel";
import {
  getEmusakFirmwareVersion,
  getEmusakSaves,
  getEmusakShadersCount,
  IEmusakSaves,
  IEmusakShadersCount
} from "../../../api/emusak";

interface IRyuGameListProps {
  config: IRyujinxConfig;
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
}));

const RyuGameList = ({ config }: IRyuGameListProps) => {
  const classes = useStyles();
  const [games, setGames]: [string[], Function] = useState([]);
  const [gamesData]: [{id: string, title: string}[], Function] = useState(eshopData);
  const [localShadersCount, setLocalShadersCount]: [IryujinxLocalShaderConfig[], Function] = useState([]);

  const [modalOpen, setModalOpen]: [boolean, Function] = React.useState(false);
  const [progressValue, setProgressValue]: [number, Function] = React.useState(0);

  const [emusakShadersCount, setEmusakShadersCount]: [IEmusakShadersCount, Function] = useState(null);
  const [emusakSaves, setEmusakSaves]: [IEmusakSaves, Function] = useState({});
  const [emusakFirmwareVersion, setEmusakFirmwareVersion]: [string, Function] = useState('');

  const initPage = () => {
    readGameList(config).then(g => setGames(g));
    getEmusakShadersCount().then(d => {
      const loweredKeysObject: any = {};
      const titlesIDs = Object.keys(d);
      titlesIDs.forEach(t => loweredKeysObject[t.toLowerCase()] = d[t])
      setEmusakShadersCount(loweredKeysObject);
    });
    getEmusakSaves().then(s => setEmusakSaves(s));
    getEmusakFirmwareVersion().then(v => setEmusakFirmwareVersion(v));
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
    const gameDate = eshopData.find(d => d.id.toLowerCase().includes(id.toLowerCase()))
    return gameDate ? gameDate.title : ((custom_database as ({ [key: string]: string}))[id] || id);
  }

  const extractLocalShaderCount = (titleID: string): string|number => {
    const counter = localShadersCount.find((counter: any) => counter.titleID === titleID);
    return counter && counter.count > 0 ? counter.count : 'No local shaders';
  }

  const comingSoon = () => alert('coming soon');

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

  const triggerShadersDownload = async (titleID: string) => {
    const { value } = await Swal.fire({
      title: 'Are you sure ?',
      text: 'Emusak will replace your previous shaders and you will not be able to retrive them',
      showCancelButton: true,
      confirmButtonText: `Save`,
    });

    if (!value) {
      return false;
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
        setProgressValue(value);
      }
    })

    initPage();
    await Swal.fire('Successfully downloaded shaders');
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

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <h3 style={{ lineHeight: '36px' }} key={config.path}>{config.path}</h3>
        </Grid>
        <Grid item xs={3}>
          <Button onClick={() => triggerFirmwareDownload()} color="primary" variant="contained" fullWidth>Download firmware {emusakFirmwareVersion}</Button>
        </Grid>
        <Grid item xs={3}>
          <Button onClick={() => downloadKeys(config)} color="primary" variant="contained" fullWidth>Download keys</Button>
        </Grid>
        <Grid item xs={2}>
          <span style={{ lineHeight: '36px', textAlign: 'right', display: 'block' }}>Is portable: <Chip label={config.isPortable ? 'yes': 'no'} color="primary" /></span>
        </Grid>
      </Grid>

      <Grid container style={{ margin: '20px 0' }}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Game ({games.length})</TableCell>
                  <TableCell>EmuSAK Shaders count</TableCell>
                  <TableCell>Local Shaders count</TableCell>
                  <TableCell style={{ width: 380 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              {
                (gamesData.length > 0 && emusakShadersCount && Object.keys(emusakSaves).length > 0) && (
                  <TableBody>
                    {
                      games.map((g) => (
                        <TableRow key={`${g}-${config.path}`}>
                          <TableCell>
                            <span>{extractNameFromID(g)}</span>
                            <br />
                            <span><small>{g}</small></span>
                          </TableCell>
                          <TableCell>{emusakShadersCount[g] || 'No remote shaders'}</TableCell>
                          <TableCell>{extractLocalShaderCount(g)}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => comingSoon()}
                              variant="contained"
                              color="primary"
                              disabled={!emusakSaves[g]}
                            >
                              Download save
                            </Button>
                            &nbsp;
                            &nbsp;
                            <Button
                              disabled={!emusakShadersCount[g]}
                              onClick={() => triggerShadersDownload(g)}
                              variant="contained"
                              color="primary"
                            >
                              Download shaders
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                )
              }
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
}

export default RyuGameList;
