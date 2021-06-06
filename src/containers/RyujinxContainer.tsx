import React from "react";
import {CircularProgress, Divider} from "@material-ui/core";
import RyujinxHeader from "../components/RyujinxHeader";
import FeaturesContainer from "./FeaturesContainer";
import RyujinxModel, { IRyujinxConfig } from "../storage/ryujinx";
import { downloadFirmware, onKeysDownload } from "../service/Ryujinx/system";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
}

const RyujinxContainer = ({ threshold, firmwareVersion } : IRyujinxContainerProps) => {
  const [directories] = React.useState<IRyujinxConfig[]>(RyujinxModel.getDirectories())

  const renderFeatures = () => {
    return directories.map(config => (
      <FeaturesContainer
        path={config.path}
        isPortable={config.isPortable}
        key={`ryu-${config.path}`}
        onFirmwareDownload={downloadFirmware}
        firmwareVersion={firmwareVersion}
        onKeysDownload={() => onKeysDownload(config)}
      />
    ));
  }

  return (
    <div style={{ padding: 20 }}>
      <RyujinxHeader threshold={threshold} />
      <br />
      <Divider />
      <br />

      {
        (threshold && firmwareVersion) && (
          renderFeatures()
        )
      }

      {
        (!threshold || !firmwareVersion) && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <CircularProgress />
            <h3>Loading data from emusak. If this process never finish, emusak might be temporary down or something is wrong with your network</h3>
          </div>
        )
      }
    </div>
  );
};

export default RyujinxContainer;
