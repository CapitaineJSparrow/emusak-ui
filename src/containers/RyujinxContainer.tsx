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
import { IEmusakEmulatorConfig, IEmusakShaders } from "../types";
import { getShadersCount } from "../api/emusak";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
}

const RyujinxContainer = ({ threshold, firmwareVersion } : IRyujinxContainerProps) => {
  const [directories, setDirectories] = React.useState<IEmusakEmulatorConfig[]>([]);
  const [emusakShaders, setEmusakShaders] = React.useState<IEmusakShaders>({});

  const initPage = () => {
    listGamesWithNameAndShadersCount(RyujinxModel.getDirectories()).then(setDirectories);
    getShadersCount().then(setEmusakShaders);
  }

  useEffect(() => {
    initPage();
  }, []);

  const onRyuFolderAdd = async () => {
    await addRyujinxFolder();
    initPage();
  }

  const renderFeatures = () => {
    return directories.map(config => (
      <FeaturesContainer
        config={config}
        key={`ryu-${config.path}`}
        onFirmwareDownload={installFirmware}
        firmwareVersion={firmwareVersion}
        onKeysDownload={() => onKeysDownload(config)}
        emusakShaders={emusakShaders}
        onShadersDownload={id => console.log({ id, config })}
      />
    ));
  }

  const isAppReady = threshold && firmwareVersion && Object.keys(emusakShaders).length > 0;

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
          ? renderFeatures()
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
