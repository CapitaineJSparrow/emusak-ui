import React from "react";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {Avatar, Button, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText} from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import {IRyujinxConfig} from "../../../../model/RyujinxModel";
import {IEmusakSaves, IEmusakShadersCount} from "../../../../api/emusak";
import PersonIcon from '@material-ui/icons/Person';

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
  const [selectedValue, setSelectedValue] = React.useState(null);
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <TableBody>
      <Dialog onClose={handleClose} aria-labelledby="save-dialog-ryu" open={open}>
        <DialogTitle id="save-dialog-ryu">Choose a save</DialogTitle>
        <List>
          <ListItem button>
            <ListItemAvatar>
              <Avatar>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"dsqdqs"} />
          </ListItem>
        </List>
      </Dialog>

      {
        games
          .filter(titleId => titleId != '0000000000000000')
          .map(titleId => ({ titleId, name: extractNameFromID(titleId) }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ titleId, name }) => {
            const localShadersCount = extractLocalShaderCount(titleId);
            const emusakCount: number = emusakShadersCount[titleId] || 0;

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
                    disabled={!emusakSaves[titleId]}
                    onClick={() => triggerShadersDownload(titleId, localShadersCount)}
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
