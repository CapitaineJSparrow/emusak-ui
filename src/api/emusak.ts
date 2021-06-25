import { httpRequest, httpRequestWithProgress } from "../service/HTTPService";
import { IEmusakSaves, IEmusakShaders } from "../types";

const PATHS = {
  FIRMWARE: `${process.env.EMUSAK_CDN}/firmware/firmware.zip`,
  KEYS: `${process.env.EMUSAK_CDN}/firmware/prod.keys`,
  SHADERS_COUNT: `${process.env.EMUSAK_CDN}/bo/api/shaders/ryujinx/count`,
  SHADERS_INFO: `${process.env.EMUSAK_CDN}/ryu/{id}.info`,
  SHADERS_ZIP: `${process.env.EMUSAK_CDN}/ryu/{id}.zip`,
  SAVES_LIST: `${process.env.EMUSAK_CDN}/bo/api/saves`,
}

export const getKeysContent = (): Promise<string> => httpRequest(PATHS.KEYS).then(r => r.text());

export const getRyujinxShadersCount = (): Promise<IEmusakShaders> => httpRequest(PATHS.SHADERS_COUNT).then(r => r.json());

export const downloadFirmwareWithProgress = (firmwareDestPath: string): Promise<boolean> => httpRequestWithProgress(PATHS.FIRMWARE, firmwareDestPath).catch(() => null)

export const downloadShaderInfo = (titleId: string): Promise<ArrayBuffer> => httpRequest(PATHS.SHADERS_INFO.replace('{id}', titleId)).then(r => r.arrayBuffer())

export const downloadShaderZip = (titleId: string, destPath: string): Promise<boolean> => httpRequestWithProgress(PATHS.SHADERS_ZIP.replace('{id}', titleId), destPath);

export const getSavesList = (): Promise<IEmusakSaves> => httpRequest(PATHS.SAVES_LIST).then(r => r.json());
