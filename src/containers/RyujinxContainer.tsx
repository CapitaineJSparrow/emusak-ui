import React from "react";
import { Divider } from "@material-ui/core";
import RyujinxHeader from "../components/RyujinxHeader";
import FeaturesContainer from "../components/features/FeaturesContainer";
import RyujinxModel, { IRyujinxConfig } from "../storage/ryujinx";
import { downloadFirmware, onKeysDownload } from "../service/Ryujinx/fs";

interface IRyujinxContainerProps {
  threshold: number;
}

const RyujinxContainer = ({ threshold } : IRyujinxContainerProps) => {
  const [directories] = React.useState<IRyujinxConfig[]>(RyujinxModel.getDirectories())

  return (
    <div style={{ padding: 20 }}>
      <RyujinxHeader threshold={threshold} />
      <br />
      <Divider />
      <br />

      {
        directories.map(config => (
          <FeaturesContainer
            path={config.path}
            isPortable={config.isPortable}
            key={`ryu-${config.path}`}
            onFirmwareDownload={downloadFirmware}
            onKeysDownload={() => onKeysDownload(config)}
          />
        ))
      }
    </div>
  );
};

export default RyujinxContainer;
