import React from "react";
import {Box, LinearProgress, makeStyles, Modal, Typography} from "@material-ui/core";
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

function LinearProgressWithLabel(props: any) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{Math.round(props.value)} %</Typography>
      </Box>
    </Box>
  )
}

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
        <LinearProgressWithLabel variant="buffer" value={progress} valueBuffer={0} />
      </div>
    </Modal>
  )
}

export default DownloadProgressComponent;
