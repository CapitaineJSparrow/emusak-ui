import React from "react";
import { Avatar, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText } from "@material-ui/core";
import FolderIcon from '@material-ui/icons/Folder';
import ArchiveIcon from '@material-ui/icons/Archive';
import { filePickerEvent } from "../../events";
import { IEmusakFilePickerDirent } from "../../types";

interface IFilePickerEvent {
  detail: { dirents: IEmusakFilePickerDirent[] }
}

const FilePickerComponent = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [dirents, setDirents] = React.useState<IEmusakFilePickerDirent[]>([]);

  const handleClose = () => {
    filePickerEvent.dispatchEvent(new CustomEvent('close'));
    setOpen(false);
  }

  const onDirentPick = (dirent: IEmusakFilePickerDirent) => {
    filePickerEvent.dispatchEvent(new CustomEvent('picked', { detail: dirent } as Event & { detail: IEmusakFilePickerDirent }));
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
          dirents.map((dirent, i) => {
            const parts = dirent.label.split('.');
            const kind = parts.pop(); // Remove extension from label
            let label: string = parts.join();

            return (
              <ListItem onClick={() => onDirentPick(dirent)} key={`component-filepicker-${i}`} button>
                <ListItemAvatar>
                  <Avatar>
                    { ['zip', 'rar', '7z', '7zip'].includes(kind) ? <ArchiveIcon /> : <FolderIcon /> }
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={label} />
              </ListItem>
            );
          })
        }
      </List>
    </Dialog>
  );
};

export default FilePickerComponent;
