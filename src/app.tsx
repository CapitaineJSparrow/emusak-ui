import * as React from 'react';
import { useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import UpdateFeedbackComponent from "./components/UpdateFeedbackComponent";
import * as electron from "electron";
import AppBarComponent from "./components/AppBarComponent";
import RyujinxContainer from "./containers/RyujinxContainer";
import { getFirmwareVersion, getLatestVersionNumber, getThresholdValue } from "./api/github";
import DownloadProgressComponent from "./components/ui/DownloadProgressComponent";
import { getSavesList, listMods } from "./api/emusak";
import { IDownloadState, IEmusakMod, IEmusakSaves } from "./types";
import FilePickerComponent from "./components/ui/FilePickerComponent";

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const App = () => {
  const [downloadState, setDownloadState] = React.useState<IDownloadState>(false);
  const [threshold, setThreshold] = React.useState(1E6);
  const [latestVersion, setLatestVersion] = React.useState<string>(null);
  const [firmwareVersion, setFirmwareVersion] = React.useState<string>(null);
  const [emusakSaves, setEmusakSaves] = React.useState<IEmusakSaves>({});
  const [emusakMods, setEmusakMods] = React.useState<IEmusakMod[]>([]);

  const currentVersion = electron.remote.app.getVersion();
  document.querySelector('title').innerText = `Emusak v${currentVersion}`

  electron.ipcRenderer.on('update-available', () => setDownloadState('DOWNLOADING'));
  electron.ipcRenderer.on('update-downloaded', () => setDownloadState('DOWNLOADED'));
  const onRestartToApplyUpdate = () => electron.ipcRenderer.send('reboot-after-download');

  useEffect(() => {
    getThresholdValue().then(t => setThreshold(t));
    getLatestVersionNumber().then(v => setLatestVersion(v));
    getFirmwareVersion().then(v => setFirmwareVersion(v));
    getSavesList().then(setEmusakSaves);
    listMods().then(r => {
      console.log(r);
      setEmusakMods(r);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <AppBarComponent />
        <UpdateFeedbackComponent
          latestVersion={latestVersion}
          currentVersion={currentVersion}
          downloadState={downloadState}
          onRestartToApplyUpdate={onRestartToApplyUpdate}
        />
        <RyujinxContainer
          threshold={threshold}
          firmwareVersion={firmwareVersion}
          emusakSaves={emusakSaves}
          emusakMods={emusakMods}
        />
        <DownloadProgressComponent />
        <FilePickerComponent />
      </CssBaseline>
    </ThemeProvider>
  )
}

ReactDOM.render(
  <App />,
  document.querySelector("#app")
);
