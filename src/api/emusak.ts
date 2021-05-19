import {fetchWithRetries} from "../service/http";

export interface IEmusakShadersCount {
  [key: string]: number;
}

export interface IEmusakSaves {
  [key: string]: string;
}

export const enum PATHS {
  COUNT_SHADERS = '/api/shaders/ryujinx/count',
  LIST_SAVES = '/api/saves',
  FIRMWARE_VERSION = '/api/firmware/version',
  PROD_KEYS = '/api/keys',
  FIRMWARE_DOWNLOAD = '/api/firmware',
  INFO_DOWNLOAD = '/api/shaders/ryujinx?type=info',
  ZIP_DOWNLOAD = '/api/shaders/ryujinx?type=zip',
}

export const getEmusakShadersCount = async (): Promise<IEmusakShadersCount> => fetchWithRetries(`${process.env.EMUSAK_URL}${PATHS.COUNT_SHADERS}`).then((r: Response) => r.json())

export const getEmusakSaves = async (): Promise<IEmusakSaves> => fetch(`${process.env.EMUSAK_URL}${PATHS.LIST_SAVES}`).then(r => r.json())

export const getEmusakFirmwareVersion = async (): Promise<string> => fetch(`${process.env.EMUSAK_URL}${PATHS.FIRMWARE_VERSION}`).then(r => r.text()).then(v => v);

export const getEmusakProdKeys = async (): Promise<string> => fetch(`${process.env.EMUSAK_URL}${PATHS.PROD_KEYS}`).then(r => r.text()).then(v => v);

export const postEmusakShaderShare = async (message: string): Promise<any> => fetch(`${process.env.EMUSAK_URL}/api/submit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain'
  },
  body: JSON.stringify({
    message
  })
})
