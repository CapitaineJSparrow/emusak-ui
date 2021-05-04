import path from "path";
import {IRyujinxConfig} from "../model/RyujinxModel";
import {listDirectories} from "./fs";
import * as electron from "electron";
import * as fs from "fs/promises";
import zip from "adm-zip";
import {getEmusakProdKeys, PATHS} from "../api/emusak";
import Swal from "sweetalert2";
import {downloadFileWithProgress} from "./http";

export interface IryujinxLocalShaderConfig {
  titleID: string;
  count: number;
}

const getRyujinxPath = (config: IRyujinxConfig, ...paths: string[]): string => {
  let dir;

  if (config.isPortable) {
    dir = path.resolve(config.path, 'portable', ...paths);
  } else {
    dir = path.resolve((electron.app || electron.remote.app).getPath('appData'), 'Ryujinx', ...paths);
  }

  return dir;
}

export const readGameList = async (config: IRyujinxConfig) => {
  let gamesDirectory = getRyujinxPath(config, 'games');
  return (await listDirectories(gamesDirectory)).map(titleId => titleId.toLowerCase());
}

export const countShaderForGame = async (config: IRyujinxConfig, titleID: string): Promise<IryujinxLocalShaderConfig> => {
  let shaderZipPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');

  const exists = await fs.access(shaderZipPath).then(() => true).catch(() => false);
  let count = 0;

  if (exists) { // To get shaders count, we just have to count files in zip archive
    const archive = new zip(shaderZipPath);
    count = archive.getEntries().length;
  }

  return {
    titleID,
    count
  };
}

export const downloadKeys = async (config: IRyujinxConfig): Promise<any> => {
  const file = await getEmusakProdKeys();
  let prodKeysPath = getRyujinxPath(config, 'system', 'prod.keys');

  await fs.writeFile(prodKeysPath, file, 'utf-8');
  return Swal.fire('Job done !', `Created or replaced keys at : ${prodKeysPath}`)
}

export const downloadInfo = async (config: IRyujinxConfig, titleID: string, progressCallback?: Function): Promise<any> => {
  let shaderInfoPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program');

  const exists = await fs.access(shaderInfoPath).then(() => true).catch(() => false);

  if (!exists) {
    await fs.mkdir(shaderInfoPath, { recursive: true });
  }

  return downloadFileWithProgress({
    progressCallback,
    filePath: path.resolve(shaderInfoPath, 'cache.info'),
    url: `${PATHS.INFO_DOWNLOAD}&id=${titleID}`
  });
}

export const downloadShaders = async (config: IRyujinxConfig, titleID: string, progressCallback?: Function): Promise<any> => {
  let shaderZipPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');

  return downloadFileWithProgress({
    progressCallback,
    filePath: shaderZipPath,
    url: `${PATHS.ZIP_DOWNLOAD}&id=${titleID}`
  });
}
