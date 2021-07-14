import React from "react";
import { Box, Button, LinearProgress, makeStyles, Modal, Typography } from "@material-ui/core";
import { progressEvent } from "../../events";

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

const LinearProgressWithLabel = (props: any) => (
  <Box display="flex" alignItems="center">
    <Box width="100%" mr={1}>
      <LinearProgress variant="determinate" {...props} />
    </Box>
    <Box style={{ textAlign: 'right' }} minWidth={140}>
      <Typography variant="body2" color="textSecondary">{Math.round(props.value)}% at {props.downloadspeed} Mbps</Typography>
    </Box>
  </Box>
);

const DownloadProgressComponent = () => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [downloadSpeed, setDownloadSpeed] = React.useState(0);

  progressEvent.addEventListener('progress', ({ detail }: any) => {
    setModalOpen(detail.open);
    setProgress(detail.progress);
    setDownloadSpeed(detail.downloadSpeed);
  });

  const onCancelButtonClick = () => {
    progressEvent.dispatchEvent(new CustomEvent('progress-cancel'));
    setModalOpen(false);
    setProgress(0);
    setDownloadSpeed(0);
  }

  return (
    <Modal
      open={modalOpen}
      onClose={() => {}}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      disableBackdropClick
    >
      <Box className={classes.modal}>
        <h2 id="simple-modal-title">Downloading ...</h2>
        <br />
        <LinearProgressWithLabel variant="buffer" value={progress} downloadspeed={downloadSpeed} valueBuffer={0} />
        <br />
        <Button onClick={onCancelButtonClick} style={{ float: 'right' }} variant="contained" color="secondary">Cancel</Button>
      </Box>
    </Modal>
  )
}

export default DownloadProgressComponent;
