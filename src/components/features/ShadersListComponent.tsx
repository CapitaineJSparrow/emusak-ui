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

interface IShadersListComponentProps {
  games: IEmusakGame[];
  emusakShaders: IEmusakShaders;
  onShareShaders: Function;
  onShadersDownload: (id: string) => void;
  threshold: number;
}

const ShadersListComponent = ({ games, emusakShaders, onShadersDownload, onShareShaders, threshold }: IShadersListComponentProps) => {

  const isDownloadButtonDisabled = (emusakShaderCount: number, localShaderCount: number): boolean => !emusakShaderCount || (localShaderCount >= emusakShaderCount);

  return (
    <TableContainer className="table-sticky" style={{ overflowX: 'initial' }} component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Games ({games.length})</TableCell>
            <TableCell style={{ minWidth: 190 }}>EmuSAK shaders count</TableCell>
            <TableCell style={{ minWidth: 190 }}>Local shaders count</TableCell>
            <TableCell style={{ width: 370 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            games
              .map(g => {
                const emusakShaderCount = emusakShaders[g.id];
                const localShaderCount = g.shadersCount;
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <span dangerouslySetInnerHTML={{__html: g.name}}/>
                      <br/>
                      <span><small>{g.id.toUpperCase()}</small></span>
                    </TableCell>
                    <TableCell>{emusakShaderCount || 'No remote shaders'}</TableCell>
                    <TableCell>{localShaderCount === 0 ? 'No local shaders' : localShaderCount}</TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="space-between">
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isDownloadButtonDisabled(emusakShaderCount, localShaderCount)}
                          onClick={() => onShadersDownload(g.id)}
                        >
                          Download shaders
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => onShareShaders(g.id, localShaderCount, emusakShaderCount)}
                          disabled={!localShaderCount || (localShaderCount < (emusakShaderCount + threshold)) || (localShaderCount < threshold)}
                        >
                          Share shaders
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ShadersListComponent;
