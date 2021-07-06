import React from "react";
import { Avatar, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText } from "@material-ui/core";
import FileCopyIcon from '@material-ui/icons/FileCopy';

const FilePickerComponent = () => {
  const [open, setOpen] = React.useState<boolean>(true);

  const handleClose = () => {
    setOpen(false);
  }

  return (
    <Dialog
      onClose={handleClose}
      open={open}
    >
      <DialogTitle style={{ textAlign: 'center' }}>Choose a file to download</DialogTitle>
      <List style={{ width: 400 }}>
        <ListItem style={{ padding: 0 }}>
          <ListItem button>
            <ListItemAvatar>
              <Avatar>
                <FileCopyIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"dsqdsdqs"} />
          </ListItem>
        </ListItem>
      </List>
    </Dialog>
  );
};

export default FilePickerComponent;
