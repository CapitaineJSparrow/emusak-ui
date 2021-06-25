import React, { useEffect } from "react";
import { Box, CircularProgress, Divider } from "@material-ui/core";
import RyujinxHeader from "../components/RyujinxHeader";
import FeaturesContainer from "./FeaturesContainer";
import RyujinxModel from "../storage/ryujinx";
import {
  addRyujinxFolder,
  installFirmware,
  listGamesWithNameAndShadersCount,
  onKeysDownload
} from "../service/Ryujinx/system";
import { IEmusakEmulatorConfig, IEmusakSaves, IEmusakShaders, IRyujinxConfig } from "../types";
import { getRyujinxShadersCount } from "../api/emusak";
import { installShadersToGame } from "../service/Ryujinx/shaders";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
  emusakSaves: IEmusakSaves;
}

const RyujinxContainer = ({ threshold, firmwareVersion, emusakSaves } : IRyujinxContainerProps) => {
  const [directories, setDirectories] = React.useState<IEmusakEmulatorConfig[]>([]);
  const [emusakShaders, setEmusakShaders] = React.useState<IEmusakShaders>({});

  useEffect(() => loadContainerData(), []);

  const loadContainerData = () => {
    listGamesWithNameAndShadersCount(RyujinxModel.getDirectories()).then(setDirectories);
    getRyujinxShadersCount().then(setEmusakShaders);
  }

  const onRyuFolderAdd = async () => {
    await addRyujinxFolder();
    loadContainerData();
  }

  const onRyuShadersDownload = async (config: IRyujinxConfig, titleId: string) => {
    await installShadersToGame(config, titleId);
    loadContainerData();
  }

  const onRyuConfigRemove = (config: IRyujinxConfig) => {
    RyujinxModel.deleteDirectory(config);
    loadContainerData();
  }

  const isAppReady = Object.keys(emusakSaves).length > 0 && threshold && firmwareVersion && Object.keys(emusakShaders).length > 0;

  return (
    <Box p={3}>
      <RyujinxHeader
        threshold={threshold}
        onRyuFolderAdd={onRyuFolderAdd}
      />
      <br />
      <Divider />
      <br />

      {
        (directories.length === 0 && isAppReady) && (
          <Box style={{ textAlign: 'center' }}>
            <h3>Add a Ryujinx directory by clicking the button above.</h3>
          </Box>
        )
      }
      {
        (isAppReady)
          ? directories.map(config => (
              <FeaturesContainer
                config={config}
                key={`ryu-${config.path}`}
                onFirmwareDownload={installFirmware}
                firmwareVersion={firmwareVersion}
                onKeysDownload={() => onKeysDownload(config)}
                emusakShaders={emusakShaders}
                onShadersDownload={id => onRyuShadersDownload(config, id)}
                onEmuConfigDelete={onRyuConfigRemove}
                emusakSaves={emusakSaves}
                onRefresh={() => loadContainerData()}
              />
            ))
          : (
            <Box mt={3} style={{ textAlign: 'center' }}>
              <CircularProgress />
              <h3>Loading data from emusak. If this process never finish, emusak might be temporary down or something is wrong with your network</h3>
            </Box>
          )
      }
    </Box>
  );
};

export default RyujinxContainer;
