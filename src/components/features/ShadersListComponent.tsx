import React from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { IEmusakGame } from "../../types";

interface IShadersListComponentProps {
  games: IEmusakGame[];
}

const ShadersListComponent = ({ games }: IShadersListComponentProps) => (
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
          games.map(g => (
            <TableRow key={g.id}>
              <TableCell>{g.id}</TableCell>
              <TableCell>0</TableCell>
              <TableCell>{g.shadersCount === 0 ? 'No local shaders' : g.shadersCount}</TableCell>
              <TableCell>dsdqs</TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  </TableContainer>
);

export default ShadersListComponent;
