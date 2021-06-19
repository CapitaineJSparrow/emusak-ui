export interface IDirent {
  isDirectory: Function;
  isFile: Function;
  name: string;
}

export interface IRyujinxConfig {
  isPortable: boolean;
  path: string;
}

export interface IEmusakGame {
  id: string;
  shadersCount: number;
  name?: string;
}

export interface IEmusakEmulatorConfig {
  path: string;
  isPortable: boolean;
  games: IEmusakGame[];
}

export interface IEmusakShaders {
  [id: string]: number;
}

export interface IEmusakSaves {
  [id: string]: string[];
}
