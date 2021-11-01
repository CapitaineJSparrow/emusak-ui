import { PartialState, SetState } from "zustand/vanilla";
import { ipcRenderer } from 'electron';
import { EmusakSaves, EmusakShaders } from "../../types";

interface IBootstrap {
  isAppInitialized: boolean;
  saves: EmusakSaves;
  ryujinxShaders: EmusakShaders;
  bootstrapAppAction: () => PartialState<IBootstrap>;
}

const createBootstrapSlice = (set: SetState<IBootstrap>) => ({
  isAppInitialized: false,
  saves: {},
  ryujinxShaders: {},
  bootstrapAppAction: async () => {
    const [ryujinxShaders, saves] = await ipcRenderer.invoke('load-components');
    return set({ isAppInitialized: true, saves, ryujinxShaders });
  }
});

export default createBootstrapSlice;
