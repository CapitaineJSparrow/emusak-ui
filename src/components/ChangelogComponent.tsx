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
          <li><b><u>Never</u> ask for emusak support in official Ryujinx channels (discord, reddit, ...)</b></li>
          <li>Add yuzu support !</li>
          <li>Add tabs in header to switch emulator and save tab choice for further emusak launches</li>
          <li>Add the firmware and keys download for yuzu</li>
          <li>Add saves download for yuzu</li>
          <li>Add saves mods download for yuzu</li>
          <li>Resolve some memory leaks due to event listener never unbind</li>
          <li>Rendering performances improvements by removing filtering & titleID matching from render calls to useEffect</li>
          <li>Do not create a desktop folder at every update (should work for next update)</li>
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
