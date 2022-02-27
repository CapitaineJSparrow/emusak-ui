export type EmusakSaves = {
  [key: string]: string[];
};

export type EmusakMods = {
  "name": string
}[];

export type EmusakShaders = {
  [key: string]: number;
};

export type EmusakEmulatorsKind = "yuzu" | "ryu";

export type EmusakEmulatorConfig = {
  path: string,
  name: string,
  emulator : EmusakEmulatorsKind,
  isDefault?: boolean,
  selected?: boolean
};

export enum LS_KEYS {
  CONFIG = "v2-emulators-bin",
  TOS = "v2-tos",
  TAB = "v2-tab",
  ESHOP_UPDATE = "emusak-eshop-update-date",
  LOCALE = "emusak-locale"
}

export type EmusakEmulatorMode = {
  mode: "global" | "portable" | "fitgirl" | "pinejinx" | "pinejinxLdn",
  dataPath: string
};

export type EmusakEmulatorGames = string[];

export type EmusakEmulatorGame = {
  title: string,
  img: string
};

export type EmusakDownload = {
  filename: string,
  progress: number,
  downloadSpeed: number,
};

export type GithubLabel = {
  color: string;
  description: string;
  name: string;
};

export type GithubIssue = {
  items: {
    state: string;
    labels: GithubLabel[];
  }[];
  mode?: "id" | "name";
};

export type GameBananaMod = {
  name: string,
  url: string,
  cover: string,
};
