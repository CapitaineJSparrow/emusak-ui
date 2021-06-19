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

interface ISavesListComponentProps {
  games: IEmusakGame[];
  onSavesDownload: (id: string) => void;
  emusakSaves: IEmusakSaves;
}

const SavesListComponent = ({ games, onSavesDownload, emusakSaves }: ISavesListComponentProps) => (
  <TableContainer component={Paper}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Games ({games.length})</TableCell>
          <TableCell style={{width: 185}}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          games
            .map(g => (
              <TableRow key={g.id}>
                <TableCell>
                  <span dangerouslySetInnerHTML={{__html: g.name}}/>
                  <br/>
                  <span><small>{g.id.toUpperCase()}</small></span>
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="space-between">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onSavesDownload(g.id)}
                      disabled={!emusakSaves[g.id]}
                    >
                      Download save
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))
        }
      </TableBody>
    </Table>
  </TableContainer>
);

export default SavesListComponent;
