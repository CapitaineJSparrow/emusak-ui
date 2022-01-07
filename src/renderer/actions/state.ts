import create from 'zustand'
import createBootstrapSlice from "./bootstrap.action";
import createTitleBarSlice from "./titleBar.actions";
import emulatorConfig from "./emulatorConfig.action";
import createAlertSlice from "./alert.action";
import createEmulatorFilesSLice from "./emulatorFiles.action";
import { GetState, SetState } from "zustand/vanilla";
import createDownloadManagerSlice from "./downloadManager.action";

const useStore = create((set: SetState<any>, get: GetState<any>) => ({
  ...createBootstrapSlice(set),
  ...createTitleBarSlice(set),
  ...emulatorConfig(set, get),
  ...createAlertSlice(set),
  ...createEmulatorFilesSLice(set, get),
  ...createDownloadManagerSlice(set, get)
}))

export default useStore;
