import { EmusakDownload } from "../../types";
import { GetState, PartialState, SetState } from "zustand/vanilla";

export interface IDownloadManager {
  dlManagerFiles: EmusakDownload[],
  upsertFileAction: (file: EmusakDownload) => PartialState<IDownloadManager>,
  removeFileAction: (file: string) => PartialState<IDownloadManager>,
}

const createDownloadManagerSlice = (set: SetState<IDownloadManager>, get: GetState<IDownloadManager>) => ({
  dlManagerFiles: <IDownloadManager["dlManagerFiles"]> [],
  upsertFileAction: (file: EmusakDownload) => {
    const files = [...get().dlManagerFiles];
    const fileIndex = files.findIndex(f => f.filename === file.filename);
    fileIndex >= 0 ? files[fileIndex] = file : files.push(file);

    return set({ dlManagerFiles: files });
  },
  removeFileAction: (filename: string) => {
    const files = [...get().dlManagerFiles];
    const fileIndex = files.findIndex(f => f.filename === filename);
    files.splice(fileIndex, 1);
    return set ({ dlManagerFiles: files });
  }
});

export default createDownloadManagerSlice;
