import React from "react";
import { Avatar, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText } from "@material-ui/core";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { filePickerEvent } from "../../events";
import { IEmusakFilePickerDirent } from "../../types";

interface IFilePickerEvent {
  detail: { dirents: IEmusakFilePickerDirent[] }
}

const FilePickerComponent = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [dirents, setDirents] = React.useState<IEmusakFilePickerDirent[]>([]);

  const handleClose = () => {
    setOpen(false);
  }

  filePickerEvent.addEventListener('pick', (event: Event & IFilePickerEvent) => {
    const { detail } = event;
    setDirents(detail.dirents);
    setOpen(true);
  });

  return (
    <Dialog
      onClose={handleClose}
      open={open}
    >
      <DialogTitle style={{ textAlign: 'center' }}>Choose a file to download</DialogTitle>
      <List style={{ width: 400 }}>
        {
          dirents.map((d, i) => (
            <ListItem key={`component-filepicker-${i}`} button>
              <ListItemAvatar>
                <Avatar>
                  <FileCopyIcon/>
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={d.label}/>
            </ListItem>
          ))
        }
      </List>
    </Dialog>
  );
};

export default FilePickerComponent;
