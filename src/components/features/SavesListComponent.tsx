import React from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";
import { IEmusakGame, IEmusakSaves } from "../../types";
import { filePickerEvent } from "../../events";

interface ISavesListComponentProps {
  games: IEmusakGame[];
  onSavesDownload: (id: string) => void;
  emusakSaves: IEmusakSaves;
}

const SavesListComponent = ({ games, onSavesDownload, emusakSaves }: ISavesListComponentProps) => {

  const onSaveDownloadButtonClick = (id: string) => {
    filePickerEvent.dispatchEvent(new CustomEvent('pick', {
      detail: {
        dirents: emusakSaves[id].map(saveName => ({ label: saveName }))
      }
    }));
  }

  return (
    <TableContainer component={Paper}>
      <Table className="table-sticky" aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Games ({games.length})</TableCell>
            <TableCell style={{ width: 185 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            games
              .map(g => {
                const isEmpty = !emusakSaves[g.id];
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
                          // onClick={() => onSavesDownload(g.id)}
                          onClick={() => onSaveDownloadButtonClick(g.id)}
                          disabled={isEmpty}
                        >
                          {isEmpty ? 'No save data' : 'Download save'}
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
};

export default SavesListComponent;
