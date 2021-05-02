import path from "path";
import {IRyujinxConfig} from "../model/RyujinxModel";
import {listDirectories} from "./fs";
import * as electron from "electron";
import * as fs from "fs/promises";
import zip from "adm-zip";
import { getEmusakProdKeys } from "../api/emusak";
import Swal from "sweetalert2";

export interface IryujinxLocalShaderConfig {
  titleID: string;
  count: number;
}

export const readGameList = async (config: IRyujinxConfig) => {
  let gamesDirectory;

  if (config.isPortable) {
    gamesDirectory = path.resolve(config.path, 'portable', 'games');
  } else {
    gamesDirectory = path.resolve((electron.app || electron.remote.app).getPath('appData'), 'Ryujinx', 'games');
  }

  return (await listDirectories(gamesDirectory)).map(titleId => titleId.toLowerCase());
}

export const countShaderForGame = async (config: IRyujinxConfig, titleID: string): Promise<IryujinxLocalShaderConfig> => {
  let shaderZipPath: string;

  if (config.isPortable) {
    shaderZipPath = path.resolve(config.path, 'portable', 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  } else {
    shaderZipPath = path.resolve((electron.app || electron.remote.app).getPath('appData'), 'Ryujinx', 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  }

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
  let prodKeysPath: string;

  if (config.isPortable) {
    prodKeysPath = path.resolve(config.path, 'portable', 'system', 'prod.keys');
  } else {
    prodKeysPath = path.resolve((electron.app || electron.remote.app).getPath('appData'), 'Ryujinx', 'system', 'prod.keys')
  }

  await fs.writeFile(prodKeysPath, file, 'utf-8');
  return Swal.fire('Job done !', `Created or replaced keys at : ${prodKeysPath}`)
}
