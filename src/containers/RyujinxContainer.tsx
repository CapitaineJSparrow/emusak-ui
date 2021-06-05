import React from "react";
import { Divider } from "@material-ui/core";
import RyujinxHeader from "../components/RyujinxHeader";
import FeaturesContainer from "../components/features/FeaturesContainer";
import RyujinxModel, { IRyujinxConfig } from "../storage/ryujinx";
import { downloadFirmware } from "../service/Ryujinx/fs";

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
        directories.map(d => (
          <FeaturesContainer
            path={d.path}
            isPortable={d.isPortable}
            key={`ryu-${d.path}`}
            onFirmwareDownload={downloadFirmware}
          />
        ))
      }
    </div>
  );
};

export default RyujinxContainer;
