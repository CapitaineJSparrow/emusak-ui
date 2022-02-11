import { SetState } from "zustand/vanilla";
import { ipcRenderer } from "electron";
import { EmusakEmulatorsKind, LS_KEYS } from "../../types";
import { IEmulatorConfig } from "./emulatorConfig.action";
import { IGameAction } from "./game.action";

export interface ITitleBar {
  version: string,
  getVersionAction: () => void;
  closeEmuSAKAction: () => void;
  maximizeEmuSAKAction: () => void;
  minimizeEmuSAKAction: () => void;
  currentEmu: EmusakEmulatorsKind;
  switchEmuAction: (currentEmu: EmusakEmulatorsKind) => void;
}

const createTitleBarSlice = (set: SetState<ITitleBar & IEmulatorConfig & IGameAction>): ITitleBar => ({
  version: "",
  currentEmu: (localStorage.getItem(LS_KEYS.TAB) || "ryu") as EmusakEmulatorsKind,
  getVersionAction: async () => {
    const version = await ipcRenderer.invoke("get-app-version");
    return set({ version });
  },
  closeEmuSAKAction: async () => {
    await ipcRenderer.invoke("title-bar-action", "close");
  },
  minimizeEmuSAKAction: async () => {
    await ipcRenderer.invoke("title-bar-action", "minimize");
  },
  maximizeEmuSAKAction: async () => {
    await ipcRenderer.invoke("title-bar-action", "maximize");
  },
  switchEmuAction: (currentEmu) => {
    localStorage.setItem(LS_KEYS.TAB, currentEmu);
    return set({ currentEmu, selectedConfig: null, currentGame: null });
  }
});

export default createTitleBarSlice;
