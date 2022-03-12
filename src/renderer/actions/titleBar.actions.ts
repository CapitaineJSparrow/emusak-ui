import { SetState } from "zustand/vanilla";
import { EmusakEmulatorConfig, EmusakEmulatorsKind, LS_KEYS } from "../../types";
import { IEmulatorConfig } from "./emulatorConfig.action";
import { IGameAction } from "./game.action";
import useTranslation from "../i18n/I18nService";
import { i18n } from "../app";
import { invokeIpc } from "../utils";

export interface ITitleBar {
  version: string,
  getVersionAction: () => void;
  closeEmuSAKAction: () => void;
  maximizeEmuSAKAction: () => void;
  minimizeEmuSAKAction: () => void;
  currentEmu: EmusakEmulatorsKind;
  switchEmuAction: (currentEmu: EmusakEmulatorsKind) => void;
  switchLanguageAction: (language: string) => void;
}

const { t } = useTranslation();

const createTitleBarSlice = (set: SetState<ITitleBar & IEmulatorConfig & IGameAction>): ITitleBar => ({
  version: "",
  currentEmu: (localStorage.getItem(LS_KEYS.TAB) || "ryu") as EmusakEmulatorsKind,
  getVersionAction: async () => {
    const version = await invokeIpc("get-app-version");
    return set({ version });
  },
  closeEmuSAKAction: async () => {
    await invokeIpc("title-bar-action", "close");
  },
  minimizeEmuSAKAction: async () => {
    await invokeIpc("title-bar-action", "minimize");
  },
  maximizeEmuSAKAction: async () => {
    await invokeIpc("title-bar-action", "maximize");
  },
  switchEmuAction: (currentEmu) => {
    localStorage.setItem(LS_KEYS.TAB, currentEmu);
    return set({ currentEmu, selectedConfig: null });
  },
  switchLanguageAction: async (locale) => {
    localStorage.setItem(LS_KEYS.LOCALE, locale);
    await i18n.changeLanguage(locale);
    let configs: EmusakEmulatorConfig[] = localStorage.getItem(LS_KEYS.CONFIG) ? JSON.parse(localStorage.getItem(LS_KEYS.CONFIG)) : [];
    configs = configs.map(c => ({
      ...c,
      ...{
        name: c.isDefault ? (c.emulator === "ryu" ? t("ryuDefault") : t("yuzuDefault")) : c.name
      }
    }));
    localStorage.setItem(LS_KEYS.CONFIG, JSON.stringify(configs));

    window.location.reload();
  }
});

export default createTitleBarSlice;
