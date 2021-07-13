import { httpRequest, httpRequestWithProgress } from "../service/HTTPService";
import { IDirent, IEmusakSaves, IEmusakShaders } from "../types";

const PATHS = {
  FIRMWARE: `${process.env.EMUSAK_CDN}/firmware/firmware.zip`,
  KEYS: `${process.env.EMUSAK_CDN}/firmware/prod.keys`,

  SHADERS_COUNT: `${process.env.EMUSAK_CDN}/bo/api/shaders/ryujinx/count`,
  SHADERS_INFO: `${process.env.EMUSAK_CDN}/ryu/{id}.info`,
  SHADERS_ZIP: `${process.env.EMUSAK_CDN}/ryu/{id}.zip`,

  SAVES_LIST: `${process.env.EMUSAK_CDN}/bo/api/saves`,
  MODS_LIST: `${process.env.EMUSAK_CDN}/mods/`,
  MODS_VERSION_LIST: `${process.env.EMUSAK_CDN}/mods/{id}/`,
  MODS_LIST_BY_VERSION: `${process.env.EMUSAK_CDN}/mods/{id}/{version}/`,
  MODS_LIST_BY_MOD: `${process.env.EMUSAK_CDN}/mods/{id}/{version}/{modName}/`,

  SAVES_DOWNLOAD: `${process.env.EMUSAK_CDN}/bo/api/saves?id={id}&index={index}`,
}

export const getKeysContent = (): Promise<string> => httpRequest(PATHS.KEYS).then(r => r.text());

export const getRyujinxShadersCount = (): Promise<IEmusakShaders> => httpRequest(PATHS.SHADERS_COUNT).then(r => r.json());

export const downloadFirmwareWithProgress = (firmwareDestPath: string): Promise<boolean> => httpRequestWithProgress(PATHS.FIRMWARE, firmwareDestPath).catch(() => null)

export const downloadShaderInfo = (titleId: string): Promise<ArrayBuffer> => httpRequest(PATHS.SHADERS_INFO.replace('{id}', titleId)).then(r => r.arrayBuffer())

export const downloadShaderZip = (titleId: string, destPath: string): Promise<boolean> => httpRequestWithProgress(PATHS.SHADERS_ZIP.replace('{id}', titleId), destPath);

export const getSavesList = (): Promise<IEmusakSaves> => httpRequest(PATHS.SAVES_LIST).then(r => r.json());

export const downloadSaveAb = (id: string, index: number): Promise<ArrayBuffer> => httpRequest(PATHS.SAVES_DOWNLOAD.replace('{id}', id).replace('{index}', `${index}`)).then(r => r.arrayBuffer())

export const listMods = () => httpRequest(PATHS.MODS_LIST).then(r => r.json());

export const listModsVersionForTitleId = (id: string): Promise<IDirent[]> => httpRequest(PATHS.MODS_VERSION_LIST.replace('{id}', encodeURIComponent(id))).then(r => r.json());

export const listModsByVersion = (id: string, version: string): Promise<IDirent[]> => httpRequest(
  PATHS.MODS_LIST_BY_VERSION
    .replace('{id}', encodeURIComponent(id))
    .replace('{version}', encodeURIComponent(version))
).then(r => r.json());

export const getModByVersionAndTitle = (gameId: string, version:string, modName:string): Promise<IDirent[]> => httpRequest(
  PATHS.MODS_LIST_BY_MOD
    .replace('{id}', encodeURIComponent(gameId))
    .replace('{version}', encodeURIComponent(version))
    .replace('{modName}', encodeURIComponent(modName))
).then(r => r.json());
