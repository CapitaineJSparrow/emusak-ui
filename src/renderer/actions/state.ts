import create from 'zustand'
import createBootstrapSlice from "./bootstrap.action";
import createTitleBarSlice from "./titleBar.actions";
import emulatorConfig from "./emulatorConfig.action";
import createAlertSlice from "./alert.action";

const useStore = create((set, get) => ({
  ...createBootstrapSlice(set),
  ...createTitleBarSlice(set),
  ...emulatorConfig(set, get),
  ...createAlertSlice(set)
}))

export default useStore;
