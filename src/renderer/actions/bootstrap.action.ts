import { GetState, PartialState, SetState } from "zustand/vanilla";
import { ipcRenderer } from "electron";
import { EmusakSaves, EmusakShaders, LS_KEYS } from "../../types";
import { IDownloadManager } from "./downloadManager.action";
import useTranslation from "../i18n/I18nService";

const { t } = useTranslation();

interface IBootstrap {
  isAppInitialized: boolean;
  saves: EmusakSaves;
  ryujinxShaders: EmusakShaders;
  bootstrapAppAction: () => PartialState<IBootstrap>;
  firmwareVersion: string;
  latestVersion: string;
  currentVersion: string;
}

const lastEshopUpdate = localStorage.getItem(LS_KEYS.ESHOP_UPDATE) ? +localStorage.getItem(LS_KEYS.ESHOP_UPDATE) : Infinity;

const createBootstrapSlice = (set: SetState<IBootstrap>, get: GetState<IDownloadManager>) => ({
  isAppInitialized: false,
  saves: {},
  ryujinxShaders: {},
  firmwareVersion: "",
  latestVersion: "",
  currentVersion: "",
  bootstrapAppAction: async () => {
    const [ryujinxShaders, saves, firmwareVersion, latestVersion, currentVersion] = await ipcRenderer.invoke("load-components", process.env.EMUSAK_CDN);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (lastEshopUpdate > (tomorrow.getTime())) {
      get().upsertFileAction({
        filename: t("updatingEshop"),
        progress: Infinity,
        downloadSpeed: Infinity
      });

      ipcRenderer.invoke("update-eshop-data").then(() => {
        localStorage.setItem(LS_KEYS.ESHOP_UPDATE, `${today.getTime()}`);
        get().removeFileAction("eshop data");
      });
    }

    return set({
      isAppInitialized: true,
      saves,
      ryujinxShaders,
      firmwareVersion,
      latestVersion,
      currentVersion
    });
  }
});

export default createBootstrapSlice;
