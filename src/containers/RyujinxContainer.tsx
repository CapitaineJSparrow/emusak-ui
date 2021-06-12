import React, { useEffect } from "react";
import { Box, CircularProgress, Divider } from "@material-ui/core";
import RyujinxHeader from "../components/RyujinxHeader";
import FeaturesContainer from "./FeaturesContainer";
import RyujinxModel from "../storage/ryujinx";
import { installFirmware, listGamesWithNameAndShadersCount, onKeysDownload } from "../service/Ryujinx/system";
import { IEmusakEmulatorConfig, IEmusakShaders } from "../types";
import { getShadersCount } from "../api/emusak";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
}

const RyujinxContainer = ({ threshold, firmwareVersion } : IRyujinxContainerProps) => {
  const [directories, setDirectories] = React.useState<IEmusakEmulatorConfig[]>([]);
  const [emusakShaders, setEmusakShaders] = React.useState<IEmusakShaders>({});

  useEffect(() => {
    listGamesWithNameAndShadersCount(RyujinxModel.getDirectories()).then(setDirectories);
    getShadersCount().then(setEmusakShaders);
  }, []);

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

  return (
    <Box p={3}>
      <RyujinxHeader threshold={threshold} />
      <br />
      <Divider />
      <br />

      {
        (threshold && firmwareVersion && Object.keys(emusakShaders).length > 0)
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
