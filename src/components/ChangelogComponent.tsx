import React from "react";
import { makeStyles, Modal } from "@material-ui/core";
import electron from "electron";

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

const version = electron.remote.app.getVersion();
const LS_KEY = `changelog-${version}`;

const ChangelogComponent = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(!localStorage.getItem(LS_KEY));

  const onModalClose = () => {
    setOpen(false);
    localStorage.setItem(LS_KEY, 'true');
  }

  return (
    <Modal
      open={open}
      onClose={onModalClose}
    >
      <div className={classes.modal}>
        <h1 style={{ textAlign: 'center' }}>What's new ? v{version}</h1>
        <br />
        <ul style={{ marginLeft: 20 }}>
          <li>Complete refactoring of EmuSAK code base</li>
          <li>Major refactoring of components to be re-used between multiple switch emulators</li>
          <li>Checks if the download is complete before writing it to disk (to avoid writing files when download has been canceled for example when user lost his connection in the middle of download)</li>
          <li>Add download speed indicator to download popup</li>
          <li>You can now cancel any download</li>
          <li>You can now clear PTC cache once you installed a mod</li>
          <li>The CPU usage was reduced (mostly when downloading files)</li>
          <li>The memory usage was slightly decreased by removing javascript polyfills at build</li>
          <li>A button to make Ryujinx portable in one click was added</li>
          <li>A reload button to refresh local & remote shaders count was added</li>
          <li>The Download speed of the Servers was increased</li>
          <li>The tables headers are now sticky</li>
          <li>The decompression of ZIP-files is not bound to the renderer process anymore! That means that counting local shaders won't freeze the UI anymore</li>
          <li>Instructions to share mods or saves were added</li>
          <li>Bump firmware & title keys for latest 12.1.0 version</li>
          <li>Add a progress bar when downloading mods, because some are really heavy (Pokémon re-textured for example is 800Mo)</li>
          <li>EmuSAK now has a status page when it's down! You can check the status here: https://emusak.betteruptime.com/</li>
          <li>During last days we actively monitored up-time and now we have 100% up-time in last 4 days</li>
        </ul>
        <br/>
        <p>
          As always, thanks for testing this software. If you have more shaders than Emusak, please share them using the button. If you have any suggestion or issues, please hang me <code style={{ display: 'inline' }}>Capitaine J. Sparrow#0096</code> on discord, or feel free to create an issue on <a
          href="#" onClick={() => electron.shell.openExternal("https://github.com/stromcon/emusak-ui")}>Github</a> (or create a pull request !)
        </p>
      </div>
    </Modal>
  );
}

export default ChangelogComponent;
