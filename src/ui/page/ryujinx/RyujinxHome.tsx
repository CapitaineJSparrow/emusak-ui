import React, {useEffect, useState} from "react";
import {Button, Grid, IconButton, Tooltip} from "@material-ui/core";
import {listDirectories, listFiles} from "../../../service/fs"
import RyujinxModel, { IRyujinxConfig } from "../../../model/RyujinxModel";
import RyuGameList from "./RyuGameList";
import { pickOneFolder } from "../../../service/ui";
import Alert from '@material-ui/lab/Alert';
import Swal from "sweetalert2";
import HelpIcon from '@material-ui/icons/Help';

import {
  getEmusakFirmwareVersion,
  getEmusakSaves,
  getEmusakShadersCount,
  IEmusakSaves,
  IEmusakShadersCount
} from "../../../api/emusak";

const RyujinxHome = () => {
  const [directories, setDirectories]: [IRyujinxConfig[], Function] = useState(RyujinxModel.getDirectories());
  const [isAlertDisplayed, setIsAlertDisplayed] = useState(localStorage.getItem('ryu-alert') !== 'true');
  const [threshold, setThreshold] : [number, Function] = useState(0);
  const [customDatabase, setCustomDatabase] = useState({});
  const [emusakShadersCount, setEmusakShadersCount]: [IEmusakShadersCount, Function] = useState(null);
  const [emusakSaves, setEmusakSaves]: [IEmusakSaves, Function] = useState({});
  const [emusakFirmwareVersion, setEmusakFirmwareVersion]: [string, Function] = useState('');

  /**
   * When user pick a ryujinx folder, ensure it is valid (has Ryujinx file) and check if it is portable mode or not
   * Then add this new configuration to database
   */
  const onRyuFolderSelect = async () => {
    await Swal.fire('Notice', `You must pick a valid Ryujinx folder where "Ryujinx.exe" or "Ryujinx" (for linux users) is located. If you are using portable mode, you can add multiple Ryujinx instances by clicking again this button`)
    const path = await pickOneFolder();

    if (path) { // User did not cancel operation
      const isPortable = (await listDirectories(path)).map(p => p.toLowerCase()).includes("portable");
      const files = await listFiles(path)
      const isValidRyuDir = files.includes('Ryujinx.exe') || files.includes('Ryujinx');

      if (!isValidRyuDir) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Emusak cannot find "Ryujinx.exe" or "Ryujinx" (on linux) in this folder, please retry with a valid ryujinx directory',
        })
      } else {
        RyujinxModel.addDirectory({ isPortable, path });
        setDirectories(RyujinxModel.getDirectories()) // Refresh list
      }
    }
  }

  const onAlertClose = () => {
    localStorage.setItem('ryu-alert', 'true');
    setIsAlertDisplayed(false);
  }

  const onConfigDelete = (config: IRyujinxConfig) => {
    RyujinxModel.deleteDirectory(config);
    setDirectories(RyujinxModel.getDirectories()) // Refresh list
  }

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/threshold.txt')
      .then(r => r.text())
      .then(t => setThreshold(parseInt(t)))

    fetch('https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/custom_database.json')
      .then(r => r.json())
      .then(d => setCustomDatabase(d))

    getEmusakShadersCount().then(d => {
      const loweredKeysObject: any = {};
      const titlesIDs = Object.keys(d);
      titlesIDs.forEach(t => loweredKeysObject[t.toLowerCase()] = d[t])
      setEmusakShadersCount(loweredKeysObject);
    });

    getEmusakSaves().then(s => setEmusakSaves(s));
    getEmusakFirmwareVersion().then(v => setEmusakFirmwareVersion(v));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <Grid container>
        <Grid item xs={9} style={{ display: 'flex', alignItems: 'center' }}>
          <p>
            Shaders treshold : <code>{threshold >= 100000 ? 'Shaders submission temporary disabled': threshold}</code> <Tooltip placement="right" arrow title={
              <React.Fragment>
                <span style={{ fontWeight: 'normal', fontSize: '1.2em' }}>That means you can share Shaders if your local Shader count surpasses EmuSAK's count by this value. This is based on how many submissions we already have and our workload. Reviewing your submissions is very time consuming and it is not worth our effort if the count is below the threshold variable. Submission are limited to 1 per user per hour for now.</span>
              </React.Fragment>
            }>
            <IconButton color="primary" size="small">
              <HelpIcon />
            </IconButton>
          </Tooltip>
          </p>
        </Grid>
        <Grid item xs={3}>
          <Button color="primary" variant="contained" fullWidth onClick={() => onRyuFolderSelect()}>Add ryujinx folder</Button>
        </Grid>

        {
          isAlertDisplayed && (
            <Grid item xs={12}>
              <br />
              <Alert action={<Button onClick={() => onAlertClose()} color="inherit" size="small">dismiss</Button>} severity="info">Please note you have to launch a game 1 time to see it in the list below</Alert>
            </Grid>
          )
        }

        <Grid style={{ marginTop: 16 }} item xs={12}>
          <hr />
          <br />
          {
            directories.map((config: IRyujinxConfig) => <RyuGameList
                key={config.path}
                config={config}
                onConfigDelete={onConfigDelete}
                threshold={threshold}
                customDatabase={customDatabase}
                emusakShadersCount={emusakShadersCount}
                emusakSaves={emusakSaves}
                emusakFirmwareVersion={emusakFirmwareVersion}
              />
            )
          }
          {
            directories.length === 0 && (
              <h3 style={{ textAlign: 'center' }}>Add a Ryujinx directory by clicking the button above</h3>
            )
          }
        </Grid>
      </Grid>
    </div>
  );
}

export default RyujinxHome;
