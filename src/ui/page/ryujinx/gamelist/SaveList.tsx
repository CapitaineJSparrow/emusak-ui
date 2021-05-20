import React from "react";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {Button} from "@material-ui/core";
import {shareShader} from "../../../../service/ryujinx";
import TableBody from "@material-ui/core/TableBody";
import {IRyujinxConfig} from "../../../../model/RyujinxModel";
import {IEmusakShadersCount} from "../../../../api/emusak";

interface TableProps {
  games: string[];
  extractNameFromID: Function;
  extractLocalShaderCount: Function;
  triggerShadersDownload: Function;
  filter: string;
  config: IRyujinxConfig;
  emusakShadersCount: IEmusakShadersCount;
}

export default ({
  games,
  extractNameFromID,
  extractLocalShaderCount,
  emusakShadersCount,
  filter,
  config,
  triggerShadersDownload
}: TableProps) => (
  <TableBody>
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
                  disabled={!emusakShadersCount[titleId] || (localShadersCount >= emusakCount)}
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
