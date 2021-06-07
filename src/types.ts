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
  name: string;
}
