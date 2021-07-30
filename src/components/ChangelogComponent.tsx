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
          <li><b><u>Never</u> ask for emusak support in official Ryujinx or Yuzu channels (discord, reddit, ...)</b></li>
          <li>Improve user experience when user never launched yuzu to created required files on disk</li>
          <li>Yuzu support was added !</li>
          <li>Adds tabs in header to switch emulator and save tab choice for further emusak launches</li>
          <li>Adds the option to download firmware and keys for Yuzu</li>
          <li>You can now download Saves & Mods for Yuzu</li>
          <li>Some  memory leaks were resolves - Those could happen due to event listener never unbind</li>
          <li>The rendering performances was improved by removing filtering & titleID matching from render calls to <code>useEffect</code></li>
          <li>EmuSAK will now stop creating a desktop folder (should work for next update)</li>
          <li>Fix "make portable" button always showing even ryujinx is already portable</li>
          <li>Delay some tasks to avoid CPU load on startup</li>
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
