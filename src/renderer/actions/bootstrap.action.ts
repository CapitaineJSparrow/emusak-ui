import { PartialState, SetState } from "zustand/vanilla";
import { ipcRenderer } from 'electron';
import { EmusakSaves, EmusakShaders } from "../../types";

interface IBootstrap {
  isAppInitialized: boolean;
  saves: EmusakSaves;
  ryujinxShaders: EmusakShaders;
  bootstrapAppAction: () => PartialState<IBootstrap>;
  firmwareVersion: string;
}

const createBootstrapSlice = (set: SetState<IBootstrap>) => ({
  isAppInitialized: false,
  saves: {},
  ryujinxShaders: {},
  firmwareVersion: '',
  bootstrapAppAction: async () => {
    const [ryujinxShaders, saves, firmwareVersion] = await ipcRenderer.invoke('load-components', process.env.EMUSAK_CDN);
    console.log(firmwareVersion);
    return set({ isAppInitialized: true, saves, ryujinxShaders, firmwareVersion });
  }
});

export default createBootstrapSlice;
