import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import UpdateFeedbackComponent from "./components/UpdateFeedbackComponent";
import * as electron from "electron";
import AppBarComponent from "./components/AppBarComponent";
import RyujinxContainer from "./containers/RyujinxContainer";
import { useEffect } from "react";
import { getFirmwareVersion, getLatestVersionNumber, getThresholdValue } from "./api/github";
import DownloadProgressComponent from "./components/DownloadProgressComponent";

export type IDownloadState = false | 'DOWNLOADING' | 'DOWNLOADED';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const App = () => {
  const [downloadState, setDownloadState] = React.useState<IDownloadState>(false);
  const [threshold, setThreshold] = React.useState(0);
  const [latestVersion, setLatestVersion] = React.useState<string|null>(null);
  const [firmwareVersion, setFirmwareVersion] = React.useState<string|null>(null);

  const currentVersion = electron.remote.app.getVersion();
  document.querySelector('title').innerText = `Emusak v${currentVersion}`

  electron.ipcRenderer.on('update-available', () => setDownloadState('DOWNLOADING'));
  electron.ipcRenderer.on('update-downloaded', () => setDownloadState('DOWNLOADED'));
  const onRestartToApplyUpdate = () => electron.ipcRenderer.send('reboot-after-download');

  useEffect(() => {
    getThresholdValue().then(t => setThreshold(t));
    getLatestVersionNumber().then(v => setLatestVersion(v));
    getFirmwareVersion().then(v => setFirmwareVersion(v));
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
        />
        <DownloadProgressComponent />
      </CssBaseline>
    </ThemeProvider>
  )
}

ReactDOM.render(
  <App />,
  document.querySelector("#app")
);
