import React, {useEffect, useState} from "react";
import {Button, Chip, CircularProgress, Grid, LinearProgress, makeStyles, Modal, TextField} from "@material-ui/core";
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
  readGameList, shareShader
} from "../../../service/ryujinx";
import eshopData from "../../../assets/test.json";
import { IRyujinxConfig } from "../../../model/RyujinxModel";
import {
  IEmusakSaves,
  IEmusakShadersCount
} from "../../../api/emusak";
import { DeleteOutline } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";

interface IRyuGameListProps {
  config: IRyujinxConfig;
  onConfigDelete: Function;
  threshold: number;
  customDatabase: any;
  emusakShadersCount: IEmusakShadersCount;
  emusakSaves: IEmusakSaves;
  emusakFirmwareVersion: string;
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


const RyuGameList = ({ config, onConfigDelete, threshold, customDatabase, emusakShadersCount, emusakSaves, emusakFirmwareVersion }: IRyuGameListProps) => {
  const classes = useStyles();
  const [games, setGames]: [string[], Function] = useState([]);
  const [gamesData]: [{id: string, title: string}[], Function] = useState(eshopData);
  const [localShadersCount, setLocalShadersCount]: [IryujinxLocalShaderConfig[], Function] = useState([]);
  const [filter, setFilter]: [string|null, Function] = useState(null);

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
          <Button onClick={() => triggerFirmwareDownload()} color="primary" variant="contained" fullWidth>Download firmware {emusakFirmwareVersion}</Button>
        </Grid>
        <Grid item xs={3}>
          <Button onClick={() => downloadKeys(config)} color="primary" variant="contained" fullWidth>Download keys</Button>
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

      <Grid container style={{ margin: '20px 0' }}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 495 }}>Games ({games.length})</TableCell>
                  <TableCell>EmuSAK Shaders count</TableCell>
                  <TableCell>Local Shaders count</TableCell>
                  <TableCell style={{ width: 380 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              {
                (gamesData.length > 0 && emusakShadersCount) && (
                  <TableBody>
                    {
                      games
                        .filter(titleId => titleId != '0000000000000000')
                        .map(titleId => ({ titleId, name: extractNameFromID(titleId) }))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(({ titleId, name }) => {
                          const localShadersCount = extractLocalShaderCount(titleId);
                          const emusakCount: number = emusakShadersCount[titleId] || 0;

                          if (filter && name.toLowerCase().search(filter.toLowerCase()) === -1) {
                            return null;
                          }

                          return (
                            <TableRow key={`${titleId}-${config.path}`}>
                              <TableCell>
                                <span>{name}</span>
                                <br />
                                <span><small>{titleId.toUpperCase()}</small></span>
                              </TableCell>
                              <TableCell>{emusakCount > 0 ? emusakCount : 'No remote shaders'}</TableCell>
                              <TableCell>{localShadersCount === 0 ? 'No local shaders': localShadersCount}</TableCell>
                              <TableCell>
                                <Button
                                  disabled={!emusakShadersCount[titleId] || (localShadersCount >= emusakCount)}
                                  onClick={() => triggerShadersDownload(titleId, localShadersCount)}
                                  variant="contained"
                                  color="primary"
                                >
                                  Download shaders
                                </Button>
                                &nbsp;
                                &nbsp;
                                <Button
                                  disabled={!localShadersCount || (localShadersCount <= (emusakCount + threshold))}
                                  onClick={() => shareShader(config, titleId, name, localShadersCount, emusakCount)}
                                  variant="contained"
                                  color="primary"
                                >
                                  Share shaders
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                      })
                    }
                  </TableBody>
                )
              }
            </Table>
          </TableContainer>
          {
            (!emusakShadersCount || Object.keys(emusakSaves).length === 0) && (
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
