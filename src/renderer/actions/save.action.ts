import { SetState } from "zustand/vanilla";
import { IDownloadManager } from "./downloadManager.action";
import useStore from "./state";
import Swal from "sweetalert2";
import { invokeIpc } from "../utils";

export interface ISaveAction {
  currentSaveDownload?: string,
  setCurrentSaveDownloadAction: (id: string) => void,
  clearCurrentSaveAction: () => void,
  downloadSaveAction: (index: number, filename: string) => void,
}

const createDownloadSaveSlice = (set: SetState<ISaveAction & IDownloadManager>): ISaveAction => ({
  currentSaveDownload: null,
  setCurrentSaveDownloadAction: (currentSaveDownload) => set({ currentSaveDownload }),
  clearCurrentSaveAction: () => set({ currentSaveDownload: null }),
  downloadSaveAction: async (index, filename) => {
    const state = useStore.getState();
    state.upsertFileAction({
      filename: state.currentSaveDownload,
      downloadSpeed: Infinity,
      progress: Infinity
    });
    await invokeIpc("downloadSave", state.currentSaveDownload, index, filename);
    state.removeFileAction(state.currentSaveDownload);
    Swal.fire({
      icon: "success",
      text: `${filename} has been placed on your desktop`
    });
  }
});

export default createDownloadSaveSlice;
