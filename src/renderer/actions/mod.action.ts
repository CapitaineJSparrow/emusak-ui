import { SetState } from "zustand/vanilla";
import useStore from "./state";
import { ipcRenderer } from "electron";
import Swal from "sweetalert2";
import useTranslation from "../i18n/I18nService";
import pirate from "../resources/pirate.gif";

const { t } = useTranslation();

export interface ISaveAction {
  currentMod?: string,
  setCurrentModAction: (id: string, dataPath: string) => void,
  clearCurrentModAction: () => void,
  dataPath?: string,
  downloadModAction: (currentMod: string, version: string, pickedMod: string, dataPath: string) => Promise<any>
}

const onModDownloadProgress = (_: any, filename: string, percentage: number, pickedMod: string) => {
  if (filename !== "mod") {
    return;
  }

  console.log(percentage);

  useStore.getState().upsertFileAction({
    filename: pickedMod,
    downloadSpeed: Infinity,
    progress: percentage
  });
};

const createDownloadModSlice = (set: SetState<ISaveAction>): ISaveAction => ({
  setCurrentModAction: (currentMod, dataPath) => set({ currentMod, dataPath }),
  clearCurrentModAction: () => set({ currentMod: null, dataPath: null }),
  downloadModAction: async (currentMod, version, pickedMod, dataPath) => {
    const state = useStore.getState();
    state.upsertFileAction({
      filename: pickedMod,
      downloadSpeed: Infinity,
      progress: 0
    });

    ipcRenderer.on("download-progress", onModDownloadProgress);

    const result = await ipcRenderer.invoke("download-mod", currentMod, version, pickedMod, dataPath, state.currentEmu).catch(() => null);
    ipcRenderer.removeListener("download-progress", onModDownloadProgress);
    state.removeFileAction(pickedMod);

    if (!result) {
      return Swal.fire({
        icon: "error",
        text: t("FETCH_FAILED")
      });
    }

    Swal.fire({
      imageUrl: pirate,
      html: t("modInstalled").replace("{path}", result)
    });
  }
});

export default createDownloadModSlice;
