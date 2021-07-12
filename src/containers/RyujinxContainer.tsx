import React, { useEffect } from "react";
import { Box, CircularProgress, Divider } from "@material-ui/core";
import RyujinxHeaderComponent from "../components/RyujinxHeaderComponent";
import FeaturesContainer from "./FeaturesContainer";
import RyujinxModel from "../storage/ryujinx";
import {
  addRyujinxFolder,
  makeRyujinxPortable,
  installFirmware,
  listGamesWithNameAndShadersCount,
  downloadKeys
} from "../service/Ryujinx/system";
import { IEmusakEmulatorConfig, IEmusakSaves, IEmusakShaders, IRyujinxConfig } from "../types";
import { getRyujinxShadersCount } from "../api/emusak";
import { installShadersToGame } from "../service/Ryujinx/shaders";
import { downloadSave } from "../service/shared/saves";
import electron from "electron";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
  emusakSaves: IEmusakSaves;
}

const RyujinxContainer = ({ threshold, firmwareVersion, emusakSaves } : IRyujinxContainerProps) => {
  const [directories, setDirectories] = React.useState<IEmusakEmulatorConfig[]>([]);
  const [emusakShaders, setEmusakShaders] = React.useState<IEmusakShaders>({});
  const [needsRefresh, setNeedsRefresh] = React.useState(true);

  const refreshPageData = async () => {
    const configs = await RyujinxModel.getDirectories();
    listGamesWithNameAndShadersCount(configs).then(setDirectories);
    getRyujinxShadersCount().then(setEmusakShaders);
  }

  // On component mount
  useEffect(() => {
    needsRefresh && refreshPageData().then(() => setNeedsRefresh(false));
  }, [needsRefresh]);

  const onRyuFolderAdd = async () => {
    await addRyujinxFolder();
    setNeedsRefresh(true);
  }

  const onRyuShadersDownload = async (config: IRyujinxConfig, titleId: string) => {
    await installShadersToGame(config, titleId);
    setNeedsRefresh(true);
  }

  const onRyuConfigRemove = (config: IRyujinxConfig) => {
    RyujinxModel.deleteDirectory(config);
    setNeedsRefresh(true);
  }

  const onPortableButtonClick = async (config: IRyujinxConfig) => {
    await makeRyujinxPortable(config);
    setNeedsRefresh(true);
  }

  // App is ready once saves and shaders data are fetched, as well with firmware version and threshold values
  const isAppReady = Object.keys(emusakSaves).length > 0 && threshold && firmwareVersion && Object.keys(emusakShaders).length > 0;

  return (
    <Box p={3}>
      <RyujinxHeaderComponent
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
                onKeysDownload={() => downloadKeys(config)}
                emusakShaders={emusakShaders}
                onShadersDownload={id => onRyuShadersDownload(config, id)}
                onEmuConfigDelete={onRyuConfigRemove}
                emusakSaves={emusakSaves}
                onRefresh={() => refreshPageData()}
                onSaveDownload={downloadSave}
                onPortableButtonClick={() => onPortableButtonClick(config)}
              />
            ))
          : (
            <Box mt={3} style={{ textAlign: 'center' }}>
              <CircularProgress />
              <br />
              <br />
              <h3>Loading data from emusak. If this process never finish, emusak might be temporary down or something is wrong with your network.</h3>
              <h4>You can check emusak status by clicking this link <a href="#" onClick={() => electron.shell.openExternal("https://emusak.betteruptime.com/")}>https://emusak.betteruptime.com</a></h4>
            </Box>
          )
      }
    </Box>
  );
};

export default RyujinxContainer;
