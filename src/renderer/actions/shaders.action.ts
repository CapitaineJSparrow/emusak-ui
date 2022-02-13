import { ipcRenderer } from "electron";
import Swal from "sweetalert2";
import useStore from "./state";
import useTranslation from "../i18n/I18nService";
import { SetState } from "zustand/vanilla";

export interface IShaders {
  needRefreshShaders: boolean,
  downloadShadersAction: (titleId: string, dataPath: string) => void
}

const { t } = useTranslation();

const createShadersSlice = (set: SetState<IShaders>): IShaders => ({
  needRefreshShaders: false,
  downloadShadersAction: async (titleId, dataPath) => {
    const state = useStore.getState();

    state.upsertFileAction({
      filename: titleId,
      downloadSpeed: Infinity,
      progress: 0
    });

    const onShaderDownloadProgress = (_: any, filename: string, percentage: number) => {
      if (filename !== titleId) {
        return;
      }

      useStore.getState().upsertFileAction({
        filename: titleId,
        downloadSpeed: Infinity,
        progress: percentage
      });
    };

    ipcRenderer.on("download-progress", onShaderDownloadProgress);
    const result = await ipcRenderer.invoke("install-shaders", titleId, dataPath).catch(() => null);
    state.removeFileAction(titleId);

    if (!result) {
      Swal.fire({
        icon: "error",
        text: t("FETCH_FAILED")
      });
      return set({ needRefreshShaders: !state.needRefreshShaders });
    }

    Swal.fire({
      icon: "success",
      text: "good !"
    });
    return set({ needRefreshShaders: !state.needRefreshShaders });
  }
});

export default createShadersSlice;
