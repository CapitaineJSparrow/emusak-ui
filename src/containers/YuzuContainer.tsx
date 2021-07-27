import * as React from "react";
import { IEmusakMod, IEmusakSaves } from "../types";
import FeaturesContainer from "./FeaturesContainer";
import { downloadSave } from "../service/shared/saves";
import { Box, CircularProgress } from "@material-ui/core";
import electron from "electron";
import { installFirmware, installKeysToYuzu } from "../service/yuzu/system";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
  emusakSaves: IEmusakSaves;
  emusakMods: IEmusakMod[];
}

const YuzuContainer = ({threshold, firmwareVersion, emusakSaves, emusakMods}: IRyujinxContainerProps) => {

  // App is ready once saves, mods and shaders data are fetched, as well with firmware version and threshold values
  const isAppReady = Object.keys(emusakSaves).length > 0
    && threshold
    && firmwareVersion
    && emusakMods.length > 0;

  return (
    <Box p={3}>
      {
        (isAppReady)
          ? (
            <FeaturesContainer
              config={{ isPortable: false, games: [] }}
              key={`yuzu`}
              onFirmwareDownload={installFirmware}
              firmwareVersion={firmwareVersion}
              onKeysDownload={installKeysToYuzu}
              emusakShaders={{}}
              onShadersDownload={() => {}}
              onEmuConfigDelete={() => {}}
              emusakSaves={emusakSaves}
              emusakMods={emusakMods}
              threshold={threshold}
              onRefresh={() => {}}
              onSaveDownload={downloadSave}
              onShareShaders={() => {}}
              onModsDownload={() => {}}
              onPortableButtonClick={() => {}}
              emulator="yuzu"
            />
          )
          : (
            <Box mt={3} style={{textAlign: 'center'}}>
              <CircularProgress/>
              <br/>
              <br/>
              <h3>Loading data from emusak. If this process never finish, emusak might be temporary down or
                something is wrong with your network.</h3>
              <h4>You can check emusak status by clicking this link <a href="#" onClick={() => electron.shell.openExternal("https://emusak.betteruptime.com/")}>https://emusak.betteruptime.com</a>
              </h4>
            </Box>
          )
      }
    </Box>
  );
};

export default YuzuContainer;
