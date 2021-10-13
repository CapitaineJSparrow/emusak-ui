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
          <li><b><u>Never</u> ask for EmuSAK support in the official Ryujinx or yuzu channels (Discord, Reddit, etc.)</b></li>
          <li>Improve backend reliability</li>
          <li>Fix Github Actions to push EmuSAK updates to AUR (Arch User Repository). Thanks <code>LiveLM</code> !</li>
          <li>Fix an issue preventing users to display "Download keys" or "firmware" buttons when they have never launched any game in Yuzu.</li>
          <li>Add FitGirl Repacks support, I don't recommend to use them but it's mainly to avoid people asking for support.</li>
        </ul>
        <br/>
        <p>
          As always, thanks for testing this software. If you have more shaders than EmuSAK, please share them using the button. If you have any suggestion or issues, please message me <code style={{ display: 'inline' }}>Capitaine J. Sparrow#0096</code> on Discord, or feel free to create an issue on <a
          href="#" onClick={() => electron.shell.openExternal("https://github.com/stromcon/emusak-ui")}>Github</a> (or create a pull request !)
        </p>
      </div>
    </Modal>
  );
}

export default ChangelogComponent;
