import {fetchWithRetries} from "../service/http";

export interface IEmusakShadersCount {
  [key: string]: number;
}

export interface IEmusakSaves {
  [key: string]: string;
}

interface IEmusakMod {
  name: string;
  type: string;
  mtime: string;
}

export type IEmusakMods = IEmusakMod[];

export const enum PATHS {
  COUNT_SHADERS = '/api/shaders/ryujinx/count',
  LIST_SAVES = '/api/saves',
  LIST_MODS = '/mods/',
  FIRMWARE_VERSION = '/api/firmware/version',
  PROD_KEYS = '/api/keys',
  FIRMWARE_DOWNLOAD = '/firmware/firmware.zip',
  INFO_DOWNLOAD = '/api/shaders/ryujinx?type=info',
  ZIP_DOWNLOAD = '/api/shaders/ryujinx?type=zip',
}

export const getEmusakShadersCount = async (): Promise<IEmusakShadersCount> => fetchWithRetries(`${process.env.EMUSAK_URL}${PATHS.COUNT_SHADERS}`).then((r: Response) => r.json())

export const getEmusakSaves = async (): Promise<IEmusakSaves> => fetchWithRetries(`${process.env.EMUSAK_URL}${PATHS.LIST_SAVES}`).then((r: Response) => r.json())

export const getEmusakMods = async (): Promise<IEmusakMods> => fetchWithRetries(`${process.env.EMUSAK_CDN}${PATHS.LIST_MODS}`).then((r: Response) => r.json())

export const getEmusakModsVersionsForGame = async (titleId: string): Promise<IEmusakMods> => fetchWithRetries(`${process.env.EMUSAK_CDN}${PATHS.LIST_MODS}/${titleId}/`).then((r: Response) => r.json())

export const getEmusakModsForGameWithVersion = async (titleId: string, version: string): Promise<IEmusakMods> => {
  return fetchWithRetries(encodeURI(`${process.env.EMUSAK_CDN}${PATHS.LIST_MODS}/${titleId}/${version}/`)).then((r: Response) => r.json());
}

export const getEmusakMod = async (titleId: string, version: string, mod: string): Promise<any> => {
  console.log((encodeURI(`${process.env.EMUSAK_CDN}${PATHS.LIST_MODS}/${titleId}/${version}/${mod}/`)));
  return fetchWithRetries(encodeURI(`${process.env.EMUSAK_CDN}${PATHS.LIST_MODS}/${titleId}/${version}/${mod}/`)).then((r: Response) => r.json());
}

export const downloadEmusakMod = async (titleId: string, version: string, mod: string, file:string): Promise<any> => {
  return fetchWithRetries(encodeURI(`${process.env.EMUSAK_CDN}${PATHS.LIST_MODS}/${titleId}/${version}/${mod}/${file}`)).then((r: Response) => r.text());
}

export const getEmusakFirmwareVersion = async (): Promise<string> => fetchWithRetries(`${process.env.EMUSAK_URL}${PATHS.FIRMWARE_VERSION}`).then((r: Response) => r.text()).then(v => v);

export const getEmusakProdKeys = async (): Promise<string> => fetchWithRetries(`${process.env.EMUSAK_URL}${PATHS.PROD_KEYS}`).then((r: Response) => r.text()).then(v => v);

export const postEmusakShaderShare = async (message: string): Promise<any> => fetch(`${process.env.EMUSAK_URL}/api/submit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain'
  },
  body: JSON.stringify({
    message
  })
})
