import React, {useState} from "react";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {Button, CircularProgress, LinearProgress, makeStyles, Modal} from "@material-ui/core";
import {shareShader} from "../../../../service/ryujinx";
import TableBody from "@material-ui/core/TableBody";
import {IRyujinxConfig} from "../../../../model/RyujinxModel";
import {IEmusakShadersCount} from "../../../../api/emusak";

interface TableProps {
  games: string[];
  extractNameFromID: Function;
  extractLocalShaderCount: Function;
  triggerShadersDownload: Function;
  threshold: number;
  filter: string;
  config: IRyujinxConfig;
  emusakShadersCount: IEmusakShadersCount;
}

const useStyles = makeStyles((theme) => ({
  modal: {
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: 20,
    width: '50%'
  },
}));

export default ({
  games,
  extractNameFromID,
  extractLocalShaderCount,
  emusakShadersCount,
  filter,
  config,
  threshold,
  triggerShadersDownload
  }: TableProps) => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState('');

  const onShareShaderButtonClick = (config: IRyujinxConfig, titleId: string, name: string, localShadersCount: number, emusakCount: number) => {
    setCurrentGame(name);
    shareShader(
      config,
      titleId,
      name,
      localShadersCount,
      emusakCount,
      () => setModalOpen(true),
      () => setModalOpen(false),
    );
  }

  return (
    <TableBody>
      {
        games
          .filter(titleId => titleId != '0000000000000000')
          .map(titleId => ({titleId, name: extractNameFromID(titleId)}))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({titleId, name}) => {
            const localShadersCount = extractLocalShaderCount(titleId);
            const emusakCount: number = emusakShadersCount[titleId] || 0;

            if (filter && name.toLowerCase().search(filter.toLowerCase()) === -1) {
              return null;
            }

            return (
              <>
                <Modal
                  open={modalOpen}
                  onClose={() => {}}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                >
                  <div className={classes.modal}>
                    <h2 style={{textAlign: 'center', fontWeight: 'normal'}}>Please run <b>{currentGame}</b> in Ryujinx !</h2>

                    <ul style={{listStyle: 'none'}}>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <span> <CircularProgress color="secondary" size={30} /></span>
                        &nbsp;
                        &nbsp;
                        <span> Waiting for <b>{currentGame}</b> to be run in ryujinx</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center' }}>
                        <span> <CircularProgress color="secondary" size={30} /></span>
                        &nbsp;
                        &nbsp;
                        <span> Waiting for shaders to be compiled</span>
                      </li>
                    </ul>
                  </div>
                </Modal>

                <TableRow key={`${titleId}-${config.path}`}>
                  <TableCell>
                    <span>{name}</span>
                    <br/>
                    <span><small>{titleId.toUpperCase()}</small></span>
                  </TableCell>
                  <TableCell>{emusakCount > 0 ? emusakCount : 'No remote shaders'}</TableCell>
                  <TableCell>{localShadersCount === 0 ? 'No local shaders' : localShadersCount}</TableCell>
                  <TableCell>
                    <Button
                      disabled={!emusakShadersCount[titleId] || (localShadersCount >= emusakCount)}
                      onClick={() => triggerShadersDownload(titleId, localShadersCount)}
                      variant="contained"
                      color="primary"
                    >
                      Download shaders
                    </Button>
                    &nbsp;
                    &nbsp;
                    <Button
                      disabled={!localShadersCount || (localShadersCount <= (emusakCount + threshold))}
                      onClick={() => onShareShaderButtonClick(config, titleId, name, localShadersCount, emusakCount)}
                      variant="contained"
                      color="primary"
                    >
                      Share shaders
                    </Button>
                  </TableCell>
                </TableRow>
              </>
            )
          })
      }
    </TableBody>
  );
}
