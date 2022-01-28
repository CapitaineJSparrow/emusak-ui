import { PartialState, SetState } from "zustand/vanilla";
import { ipcRenderer } from "electron";
import { EmusakSaves, EmusakShaders } from "../../types";

interface IBootstrap {
  isAppInitialized: boolean;
  saves: EmusakSaves;
  ryujinxShaders: EmusakShaders;
  bootstrapAppAction: () => PartialState<IBootstrap>;
  firmwareVersion: string;
  latestVersion: string;
  currentVersion: string;
}

const createBootstrapSlice = (set: SetState<IBootstrap>) => ({
  isAppInitialized: false,
  saves: {},
  ryujinxShaders: {},
  firmwareVersion: "",
  latestVersion: "",
  currentVersion: "",
  bootstrapAppAction: async () => {
    const [ryujinxShaders, saves, firmwareVersion, latestVersion, currentVersion] = await ipcRenderer.invoke("load-components", process.env.EMUSAK_CDN);
    return set({ isAppInitialized: true, saves, ryujinxShaders, firmwareVersion, latestVersion, currentVersion });
  }
});

export default createBootstrapSlice;
