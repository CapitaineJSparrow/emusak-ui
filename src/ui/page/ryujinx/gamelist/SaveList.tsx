import React from "react";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {
  Avatar,
  Button,
  Dialog,
  DialogTitle, LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText, makeStyles,
  Modal
} from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import {IRyujinxConfig} from "../../../../model/RyujinxModel";
import {IEmusakSaves, IEmusakShadersCount} from "../../../../api/emusak";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import {downloadSaveWithProgress} from "../../../../service/ryujinx";

interface TableProps {
  games: string[];
  extractNameFromID: Function;
  extractLocalShaderCount: Function;
  triggerShadersDownload: Function;
  filter: string;
  config: IRyujinxConfig;
  emusakShadersCount: IEmusakShadersCount;
  emusakSaves: IEmusakSaves;
}

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

export default ({
  games,
  extractNameFromID,
  extractLocalShaderCount,
  emusakShadersCount,
  filter,
  config,
  triggerShadersDownload,
  emusakSaves
}: TableProps) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [saves, setSaves]: [string[], Function] = React.useState([]);
  const [selectedTitleId, setSelectedTitleId] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [progressValue, setProgressValue]: [number, Function] = React.useState(0);

  const handleClose = () => {
    setOpen(false);
  };

  const onSaveDownloadClick = (titleId: string) => {
    setSaves(emusakSaves[titleId]);
    setSelectedTitleId(titleId);
    setOpen(true);
  }

  const onSavePick = (filename: string) => {
    setOpen(false);
    setModalOpen(true);

    downloadSaveWithProgress((p: number) => {
      if (p !== progressValue) {
        setProgressValue(p)
      }

      if (p >= 100) {
        // Download finished
        setModalOpen(false)
        setProgressValue(0);
      }
    }, selectedTitleId, filename);
  }

  return (
    <TableBody>
      <Dialog onClose={handleClose} aria-labelledby="save-dialog-ryu" open={open}>
        <DialogTitle id="save-dialog-ryu">Pick a file</DialogTitle>
        <List>
          {
            saves.map(s => (
              <ListItem onClick={() => onSavePick(s)} key={s} button>
                <ListItemAvatar>
                  <Avatar>
                    <FileCopyIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={s} />
              </ListItem>
            ))
          }
        </List>
      </Dialog>


      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        disableBackdropClick
      >
        <div className={classes.modal}>
          <h2 id="simple-modal-title">Downloading ...</h2>
          <br />
          <LinearProgress variant="buffer" value={progressValue} valueBuffer={0} />
        </div>
      </Modal>

      {
        games
          .filter(titleId => titleId != '0000000000000000')
          .map(titleId => ({ titleId, name: extractNameFromID(titleId) }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ titleId, name }) => {
            if (filter && name.toLowerCase().search(filter.toLowerCase()) === -1) {
              return null;
            }

            return (
              <TableRow key={`${titleId}-${config.path}`}>
                <TableCell>
                  <span>{name}</span>
                  <br />
                  <span><small>{titleId.toUpperCase()}</small></span>
                </TableCell>
                <TableCell>
                  <Button
                    disabled={!emusakSaves[titleId.toUpperCase()]}
                    onClick={() => onSaveDownloadClick(titleId.toUpperCase())}
                    variant="contained"
                    color="primary"
                  >
                    Download save
                  </Button>
                </TableCell>
              </TableRow>
            )
          })
      }
    </TableBody>
  )
}
