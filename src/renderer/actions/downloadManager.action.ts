import { EmusakDownload } from "../../types";
import { GetState, SetState } from "zustand/vanilla";
import useStore from "./state";

export interface IDownloadManager {
  dlManagerFiles: EmusakDownload[],
  upsertFileAction: (file: EmusakDownload) => void,
  removeFileAction: (file: string) => void,
  updateFileProgress: (filename: string, eventKey: string, percentage: number, downloadSpeed?: number) => void,
}

const createDownloadManagerSlice = (set: SetState<IDownloadManager>, get: GetState<IDownloadManager>): IDownloadManager => ({
  dlManagerFiles: [],
  upsertFileAction: (file) => {
    const files = [...get().dlManagerFiles];
    const fileIndex = files.findIndex(f => f.filename === file.filename);
    fileIndex >= 0 ? files[fileIndex] = file : files.push(file);

    return set({ dlManagerFiles: files });
  },
  removeFileAction: (filename) => {
    const files = [...get().dlManagerFiles];
    const fileIndex = files.findIndex(f => f.filename === filename);
    files.splice(fileIndex, 1);
    return set ({ dlManagerFiles: files });
  },
  updateFileProgress: (filename, eventKey, percentage, downloadSpeed = Infinity) => {
    if (filename !== eventKey) {
      return;
    }

    useStore.getState().upsertFileAction({
      filename: filename,
      downloadSpeed,
      progress: percentage
    });
  }
});

export default createDownloadManagerSlice;
