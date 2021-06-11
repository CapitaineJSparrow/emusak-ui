import { httpRequest, httpRequestWithProgress } from "../service/HTTPService";
import { IEmusakShaders } from "../types";

const PATHS = {
  FIRMWARE: `${process.env.EMUSAK_CDN}/firmware/firmware.zip`,
  KEYS: `${process.env.EMUSAK_CDN}/firmware/prod.keys`,
  SHADERS_COUNT: `${process.env.EMUSAK_CDN}/bo/api/shaders/ryujinx/count`
}

export const getKeysContent = (): Promise<string> => httpRequest(PATHS.KEYS).then(r => r.text());

export const getShadersCount = (): Promise<IEmusakShaders> => httpRequest(PATHS.SHADERS_COUNT).then(r => r.json());

export const downloadFirmwareWithProgress = (firmwareDestPath: string): Promise<boolean> => httpRequestWithProgress(PATHS.FIRMWARE, firmwareDestPath).catch(() => null)
