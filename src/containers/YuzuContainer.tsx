import * as React from "react";
import { IEmusakGame, IEmusakMod, IEmusakSaves } from "../types";
import FeaturesContainer from "./FeaturesContainer";
import { downloadSave } from "../service/shared/saves";
import { Box, CircularProgress, Divider } from "@material-ui/core";
import electron from "electron";
import { addYuzuFolder, getYuzuGames, installFirmware, installKeysToYuzu, installMod, isValidFileSystem } from "../service/yuzu/system";
import { useEffect } from "react";
import Swal from "sweetalert2";
import EmulatorHeaderComponent from "../components/EmulatorHeaderComponent";

interface IRyujinxContainerProps {
  threshold: number;
  firmwareVersion: string;
  emusakSaves: IEmusakSaves;
  emusakMods: IEmusakMod[];
}

const YuzuContainer = ({threshold, firmwareVersion, emusakSaves, emusakMods}: IRyujinxContainerProps) => {
  const [games, setGames] = React.useState<IEmusakGame[]>([]);
  const [isValid, setIsValid] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const loadPageData = async () => {
    setTimeout(async () => {
      const isValidFS = await isValidFileSystem();
      const g = await getYuzuGames();

      if (!isValidFS) {
        Swal.fire({
          icon: 'error',
          text: 'Cannot find a valid filesystem for yuzu. You need to run yuzu one time to let it create required folders on your disk. Once you ran yuzu, please use the reload button near the "Filter game list" input. If you are using yuzu with portable mode, use the "Add yuzu folder" above.'
        })
        return false;
      }

      setIsValid(true);
      setGames(g || []);
      setLoaded(true);
    }, loaded ? 0 : 500); // Delay rendering to avoid too many tasks on CPU at the same time
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
      <EmulatorHeaderComponent
        threshold={threshold}
        onFolderAdd={addYuzuFolder}
        emulator="yuzu"
      />
      <br/>
      <Divider/>
      <br/>
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
              emusakSaves={emusakSaves}
              emusakMods={emusakMods}
              threshold={threshold}
              onRefresh={loadPageData}
              onSaveDownload={downloadSave}
              onShareShaders={() => {}}
              onModsDownload={installMod}
              emulator="yuzu"
              isValid={isValid}
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
