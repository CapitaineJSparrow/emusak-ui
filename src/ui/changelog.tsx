import React from "react";
import {makeStyles, Modal} from "@material-ui/core";
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

const LS_KEY = "changelog-1022";

const Changelog = () => {
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
        <h1 style={{ textAlign: 'center' }}>What's new ? v{electron.remote.app.getVersion()}</h1>
        <br />
        <ul style={{ marginLeft: 20 }}>
          <li>Changed wording in this popup</li>
          <li>Added emusak version in the titlebar</li>
          <li>Do not warn about data erase when downloading shaders if you do not have any shaders locally</li>
          <li>Added a search to filter games</li>
          <li>Added missing title id for <code>Crash Bandicoot 4: It's About Time</code></li>
        </ul>
        <br/>
        <p>
          As always, thanks for testing this software. If you have more shaders than Emusak, please post them in <code style={{ display: 'inline' }}>#ryu-shaders</code> or <code style={{ display: 'inline' }}>#yuzu-shaders</code> in discord server linked on top right. If you have any suggestion or issues, please hang me <code style={{ display: 'inline' }}>Capitaine J. Sparrow#0096</code> on discord, or feel free to create an issue on <a
          href="#" onClick={() => electron.shell.openExternal("https://github.com/stromcon/emusak-ui")}>Github</a> (or create a pull request !)
        </p>
      </div>
    </Modal>
  );
}

export default Changelog;
