import React, { useEffect } from "react";
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { IEmusakFilePickerDirent, IEmusakGame, IEmusakMod } from "../../types";
import { listModsByVersion, listModsVersionForTitleId } from "../../api/emusak";
import { filePickerEvent } from "../../events";

interface IModsListComponentProps {
  games: IEmusakGame[];
  emusakMods: IEmusakMod[];
}

const ModsListComponent = ({ games, emusakMods }: IModsListComponentProps) => {
  /**
   * state machine to download a mod :
   * 2. List mods version for a specific titleId (LIST)
   * 3. Download a specific mod for a given title ID and game version (MODS_LIST)
   */
  let [STATE_MACHINE, SET_STATE_MACHINE] = React.useState<'LIST' | 'MODS_LIST'>(null);
  let [pickedTitleId, setPickedTitleId] = React.useState<string>(null);
  let [pickedVersion, setPickedVersion] = React.useState<string>(null);

  const onDownloadModButtonClick = (titleId: string) => {
    setPickedTitleId(titleId);
    SET_STATE_MACHINE('LIST');
  }

  const onStateMachineChange = async () => {
    switch (STATE_MACHINE) {
      case 'LIST':
        let versions = await listModsVersionForTitleId(pickedTitleId);
        versions = versions.map((v: any) => ({ label: v.name }));
        filePickerEvent.dispatchEvent(new CustomEvent('pick', { detail: { dirents: versions } }));
        break;
      case 'MODS_LIST':
        let mods = await listModsByVersion(pickedTitleId, pickedVersion);
        mods = mods.map((m: any) => ({ label: m.name }));
        filePickerEvent.dispatchEvent(new CustomEvent('pick', { detail: { dirents: mods } }));
        break;
    }
  }

  // if user closed filePicker without picking a mod, just reset input to trigger useEffect on next button click
  filePickerEvent.addEventListener('close', () => {
    setPickedTitleId(null);
    setPickedVersion(null);
  });

  const handleFilePicked = ({ detail }: Event & { detail: IEmusakFilePickerDirent }) => {
    switch (STATE_MACHINE) {
      case 'LIST':
        setPickedVersion(detail.label);
        SET_STATE_MACHINE('MODS_LIST');
        break;
      case 'MODS_LIST':

        break;
    }
  };

  filePickerEvent.addEventListener('picked', handleFilePicked);

  useEffect(() => {
    pickedTitleId && onStateMachineChange();
    return () => filePickerEvent.removeEventListener('picked', handleFilePicked); // On component unmount
  }, [STATE_MACHINE, pickedTitleId]);

  return (
    <TableContainer component={Paper}>
      <Table className="table-sticky" aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Games ({games.length})</TableCell>
            <TableCell style={{ width: 205 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            games
              .map(g => {
                const disabled = !emusakMods.find(predicate => predicate.name.toUpperCase() === g.id)
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <span dangerouslySetInnerHTML={{ __html: g.name }}/>
                      <br/>
                      <span><small>{g.id.toUpperCase()}</small></span>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="space-between">
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          disabled={disabled}
                          onClick={() => onDownloadModButtonClick(g.id.toUpperCase())}
                        >
                          { disabled ? 'No mods data' : 'Download mods' }
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ModsListComponent;
