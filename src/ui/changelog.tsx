import React from "react";
import {makeStyles, Modal} from "@material-ui/core";

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

const LS_KEY = "changelog-1021";

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
        <h1 style={{ textAlign: 'center' }}>What's new ?</h1>
        <br />
        <ul style={{ marginLeft: 20 }}>
          <li>Fixed an issue with ryujinx firmware download. When download is finished, a windows file explorer should be displayed with downloaded firmware</li>
          <li>Added emusak version at the bottom</li>
          <li>Added this popup</li>
        </ul>
      </div>
    </Modal>
  );
}

export default Changelog;
