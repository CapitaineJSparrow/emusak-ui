import React, { useEffect } from "react";
import { IDownloadState } from "../app";
import { Alert } from "@material-ui/lab";
import Swal from "sweetalert2";
import * as electron from "electron";

interface IUpdateComponentState {
  downloadState: IDownloadState;
  onRestartToApplyUpdate: Function;
  latestVersion?: string;
  currentVersion: string;
}

const UpdateFeedbackComponent = ({
  downloadState,
  onRestartToApplyUpdate,
  latestVersion,
  currentVersion
}: IUpdateComponentState) => {

  useEffect(() => {
    if (downloadState === 'DOWNLOADED') {
      Swal.fire({
        icon: 'success',
        text: 'Update has been downloaded ! Do you want to restart to apply ?',
        showCancelButton: true
      })
      .then(({ value }) => {
        if (value) {
          onRestartToApplyUpdate();
        }
      })
    }
  }, [downloadState]);

  const renderAlert = (): React.ReactFragment => {

    // There is no auto update feature on linux, so just return an alert to ask update
    if (process.platform !== "win32") {
      if (latestVersion && (latestVersion !== currentVersion)) {
        return (
          <div style={{ padding: 20 }}>
            <Alert severity="info">
              You have version v{currentVersion}, please consider update to latest version from <a href="#" onClick={() => electron.shell.openExternal("https://github.com/stromcon/emusak-ui")}>Github</a> (v{latestVersion})
            </Alert>
          </div>
        );
      } else {
        return null;
      }
    }

    switch (downloadState) {
      case 'DOWNLOADING':
        return (<div style={{ padding: 20 }}><Alert severity="info">A new emusak version is downloading in background ! Please do not close application until it is complete.</Alert></div>);
      case 'DOWNLOADED':
        return (<div style={{ padding: 20 }}><Alert severity="info">Emusak update has been downloaded and will be applied on next launch.</Alert></div>);
      default:
        return null;
    }
  };

  return (
    <>
      { renderAlert() }
    </>
  )
};

export default UpdateFeedbackComponent;
