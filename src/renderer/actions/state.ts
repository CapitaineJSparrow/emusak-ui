import create from 'zustand'
import createBootstrapSlice from "./bootstrap.action";
import createTitleBarSlice from "./titleBar.actions";
import emulatorConfig from "./emulatorConfig.action";
import createAlertSlice from "./alert.action";
import createEmulatorFilesSLice from "./emulatorFiles.action";

const useStore = create((set, get) => ({
  ...createBootstrapSlice(set),
  ...createTitleBarSlice(set),
  ...emulatorConfig(set, get),
  ...createAlertSlice(set),
  ...createEmulatorFilesSLice(set, get),
}))

export default useStore;
