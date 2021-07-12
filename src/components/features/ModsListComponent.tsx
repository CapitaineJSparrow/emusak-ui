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
import { IEmusakGame, IEmusakMod } from "../../types";

interface IModsListComponentProps {
  games: IEmusakGame[];
  emusakMods: IEmusakMod[];
}

const ModsListComponent = ({ games, emusakMods }: IModsListComponentProps) => (
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

export default ModsListComponent;
