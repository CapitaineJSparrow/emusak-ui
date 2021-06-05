import React from "react";
import { LinearProgress, makeStyles, Modal } from "@material-ui/core";
import {progressEvent} from "../events";

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

const DownloadProgressComponent = () => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  progressEvent.addEventListener('progress', ({ detail }: any) => {
    setModalOpen(detail.open);
    setProgress(detail.progress);
  });

  return (
    <Modal
      open={modalOpen}
      onClose={() => {}}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      disableBackdropClick
    >
      <div className={classes.modal}>
        <h2 id="simple-modal-title">Downloading ...</h2>
        <br />
        <LinearProgress variant="buffer" value={progress} valueBuffer={0} />
      </div>
    </Modal>
  )
}

export default DownloadProgressComponent;
