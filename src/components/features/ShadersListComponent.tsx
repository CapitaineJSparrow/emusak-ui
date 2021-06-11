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
import { IEmusakGame, IEmusakShaders } from "../../types";
import { matchIdFromCustomDatabase, matchIdFromTinfoil } from "../../service/SwithDBService";

interface IShadersListComponentProps {
  games: IEmusakGame[];
  emusakShaders: IEmusakShaders;
}

const ShadersListComponent = ({ games, emusakShaders }: IShadersListComponentProps) => (
  <TableContainer component={Paper}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Games ({games.length})</TableCell>
          <TableCell>EmuSAK shaders count</TableCell>
          <TableCell>Local shaders count</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          games
            .map(g => ({ ...g, name: matchIdFromCustomDatabase(g.id) || matchIdFromTinfoil(g.id) || g.id }))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g => (
            <TableRow key={g.id}>
              <TableCell>
                <span dangerouslySetInnerHTML={{__html: g.name}}/>
                <br/>
                <span><small>{g.id.toUpperCase()}</small></span>
              </TableCell>
              <TableCell>{emusakShaders[g.id] || 'No remote shaders'}</TableCell>
              <TableCell>{g.shadersCount === 0 ? 'No local shaders' : g.shadersCount}</TableCell>
              <TableCell>
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="primary"
                  >
                    Download shaders
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                  >
                    Share shaders
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

export default ShadersListComponent;
