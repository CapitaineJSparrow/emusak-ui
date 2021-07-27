import * as React from "react";
import { IEmusakMod, IEmusakSaves } from "../types";
import FeaturesContainer from "./FeaturesContainer";
import { downloadSave } from "../service/shared/saves";
import { Box, CircularProgress } from "@material-ui/core";
import electron from "electron";
import { getYuzuGames, installFirmware, installKeysToYuzu, installMod } from "../service/yuzu/system";
import { useEffect } from "react";
import Swal from "sweetalert2";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
  emusakSaves: IEmusakSaves;
  emusakMods: IEmusakMod[];
}

const YuzuContainer = ({threshold, firmwareVersion, emusakSaves, emusakMods}: IRyujinxContainerProps) => {
  const [games, setGames] = React.useState([]);

  const triggerError = () => {
    Swal.fire({
      icon: 'error',
      title: "error",
      html: 'Emusak cannot found any games for yuzu, please run yuzu one time first. <b>Please note emusak does not support portable mode for yuzu yet</b>'
    })
  }

  const loadPageData = async () => {
    const g = await getYuzuGames();

    if (!g) {
      triggerError();
      return false;
    }

    setGames(g);

    if (g.length === 0) {
      triggerError();
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

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
              config={{ isPortable: false, games }}
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
              onRefresh={loadPageData}
              onSaveDownload={downloadSave}
              onShareShaders={() => {}}
              onModsDownload={installMod}
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
