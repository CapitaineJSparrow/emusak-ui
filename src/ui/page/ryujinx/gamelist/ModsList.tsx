import React from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar, ListItemText,
  TableBody,
  TableCell,
  TableRow
} from "@material-ui/core";
import {
  downloadEmusakMod,
  getEmusakMod,
  getEmusakModsForGameWithVersion,
  getEmusakModsVersionsForGame,
  IEmusakMods
} from "../../../../api/emusak";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import {IRyujinxConfig} from "../../../../model/RyujinxModel";
import {installModToRyujinx} from "../../../../service/ryujinx";

interface IModsListProps {
  games: string[],
  extractNameFromID: Function;
  emusakMods: IEmusakMods;
  config: IRyujinxConfig;
  filter: string;
}

export default ({
  games,
  extractNameFromID,
  emusakMods,
  config,
  filter,
}: IModsListProps) => {
  const [dialogVersionOpen, setDialogVersionOpen] = React.useState(false);
  const [modsDialogOpen, setModsDialogOpen] = React.useState(false);

  const [modsName, setModsName]: [string[], Function] = React.useState([]);
  const [modsVersions, setModsVersions]: [string[], Function] = React.useState([]);
  const [pickedTitleId, setPickedTitleId]: [string | null, Function] = React.useState(null);
  const [pickedVersion, setPickedVersion]: [string | null, Function] = React.useState(null);

  const handleDialogVersionClose = () => setDialogVersionOpen(false)

  const handleDialogModsClose = () => setModsDialogOpen(false)

  const handleVersionPick = async (titleId: string) => {
    let versions = await getEmusakModsVersionsForGame(titleId);
    const gameVersions  = versions.map(v => v.name);
    setModsVersions(gameVersions);
    setDialogVersionOpen(true);
    setPickedTitleId(titleId);
  }

  const handleModVersionPick = async (version: string) => {
    const modsResponse = await getEmusakModsForGameWithVersion(pickedTitleId, version);
    const mods = modsResponse.map(m => m.name);
    setDialogVersionOpen(false);
    setModsDialogOpen(true);
    setModsName(mods);
    setPickedVersion(version);
  }

  const applyMod = async (modName: string) => {
    const modFile: any[] = await getEmusakMod(pickedTitleId, pickedVersion, modName);
    const mod = modFile.find(m => m.type === "file").name;
    setModsDialogOpen(false);
    const file = await downloadEmusakMod(pickedTitleId, pickedVersion, modName, mod);
    await installModToRyujinx(config, pickedTitleId, modName, mod, file);
  }

  return (
    <TableBody>

      <Dialog onClose={handleDialogVersionClose} aria-labelledby="save-dialog-ryu" open={dialogVersionOpen}>
        <DialogTitle id="save-dialog-ryu">
          What is your game version ?
        </DialogTitle>
        <List>
          {
            modsVersions.map(version => (
              <ListItem onClick={() => handleModVersionPick(version)} key={`ryu-mod-${version}`} button>
                <ListItemAvatar>
                  <Avatar>
                    <FileCopyIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={version} />
              </ListItem>
            ))
          }
        </List>
      </Dialog>

      <Dialog onClose={handleDialogModsClose} aria-labelledby="save-dialog-ryu" open={modsDialogOpen}>
        <DialogTitle id="save-dialog-ryu">
          Pick a mod
        </DialogTitle>
        <List>
          {
            modsName.map(m => (
              <ListItem onClick={() => applyMod(m)} key={`ryu-mod-${m}`} button>
                <ListItemAvatar>
                  <Avatar>
                    <FileCopyIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={m} />
              </ListItem>
            ))
          }
        </List>
      </Dialog>

      {
        games
          .filter(titleId => titleId != '0000000000000000')
          .map(titleId => ({titleId: titleId.toUpperCase(), name: extractNameFromID(titleId)}))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({titleId, name}) => {

            if (filter && name.toLowerCase().search(filter.toLowerCase()) === -1) {
              return null;
            }

            return (
              <TableRow key={`ryu-mods-list-${titleId}`}>
                <TableCell>
                  <span>{name}</span>
                  <br />
                  <span><small>{titleId.toUpperCase()}</small></span>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleVersionPick(titleId)}
                    disabled={!emusakMods.find(m => m.name === titleId)}
                    variant="contained"
                    color="primary"
                  >
                    Download mods
                  </Button>
                </TableCell>
              </TableRow>
            )
          })
      }
    </TableBody>
  )
}
