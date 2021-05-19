import path from "path";
import {IRyujinxConfig} from "../model/RyujinxModel";
import {listDirectories} from "./fs";
import * as electron from "electron";
import * as fs from "fs";
import zip from "adm-zip";
import {getEmusakProdKeys, PATHS, postEmusakShaderShare} from "../api/emusak";
import Swal from "sweetalert2";
import rimraf from "rimraf";
import {downloadFileWithProgress} from "./http";

export interface IryujinxLocalShaderConfig {
  titleID: string;
  count: number;
}

const paths: string[] = [];

const asyncZipWrite = (archive: zip, path: string): Promise<void> => new Promise((resolve) => {
  archive.writeZip(path, () => resolve());
});

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

  const exists = await fs.promises.access(shaderZipPath).then(() => true).catch(() => false);
  let count = 0;

  if (exists) { // To get shaders count, we just have to count files in zip archive
    try {
      const archive = new zip(shaderZipPath);
      count = archive.getEntries().length;
    } catch (e) {
    }
  }

  return {
    titleID,
    count
  };
}

export const downloadKeys = async (config: IRyujinxConfig): Promise<any> => {
  const file = await getEmusakProdKeys();
  let prodKeysPath = getRyujinxPath(config, 'system', 'prod.keys');

  await fs.promises.writeFile(prodKeysPath, file, 'utf-8');
  return Swal.fire('Job done !', `Created or replaced keys at : ${prodKeysPath}`)
}

export const downloadInfo = async (config: IRyujinxConfig, titleID: string): Promise<any> => {
  let shaderInfoPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program');

  const exists = await fs.promises.access(shaderInfoPath).then(() => true).catch(() => false);

  if (!exists) {
    await fs.promises.mkdir(shaderInfoPath, {recursive: true});
  }

  return downloadFileWithProgress({
    filePath: path.resolve(shaderInfoPath, 'cache.info'),
    url: `/ryu/${titleID.toUpperCase()}.info`,
    fromCdn: true,
  });
}

export const downloadShaders = async (config: IRyujinxConfig, titleID: string, progressCallback?: Function): Promise<any> => {
  let shaderZipPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  rimraf(getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'opengl'), () => {});

  return downloadFileWithProgress({
    progressCallback,
    filePath: shaderZipPath,
    url: `/ryu/${titleID.toUpperCase()}.zip`,
    fromCdn: true
  });
}

export const downloadFirmwareWithProgress = async (progressCallback: Function): Promise<void> => {
  const filename = 'firmware.zip';
  const firmwarePath = path.resolve((electron.app || electron.remote.app).getPath('documents'), filename);
  await downloadFileWithProgress({
    progressCallback,
    filePath: firmwarePath,
    url: PATHS.FIRMWARE_DOWNLOAD,
    fromCdn: true
  });
  await Swal.fire('Job done !', 'EmuSAK will now open the downloaded firmware location. Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file')
  electron.shell.showItemInFolder(firmwarePath);
}

export const packShaders = async (config: IRyujinxConfig, titleID: string): Promise<any> => {
  const shaderZipPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  const shaderInfoPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.info');
  const archive = new zip();
  archive.addLocalFile(shaderZipPath);
  archive.addLocalFile(shaderInfoPath);

  const zipPath = path.resolve(shaderInfoPath, '..', 'upload.zip');
  await asyncZipWrite(archive, zipPath);

  return zipPath;
}

export const shareShader = async (config: IRyujinxConfig, titleID: string, GameName: string, localCount: number = 0, emusakCount: number = 0) => {
  const key = `ryu-share-${titleID}-${localCount}`;

  if (localStorage.getItem(key)) {
    Swal.fire('error', 'You already shared those shaders, thanks !');
    return false;
  }

  if (!localStorage.getItem('shaders-share-warning')) {
    const { value } = await Swal.fire({
      title: 'Notice',
      showCancelButton: true,
      html: `
      Please make sure to only share shaders that are working for you and do no "just click the button" if you are not 100% sure.
      <br />
      <br />
      Remember it takes a lot of time to validate shaders since we are downloading them and testing ingame before upload to emusak, this goes to everyone
      <br />
      <br />
      <b>Please do NOT merge two separate Shader caches (Files), this causes Shader cache corruption ~ Mid game crash. Using one as a base and adding more through playing is fine</b>
    `,
    });

    if (!value) {
      return false;
    }

    localStorage.setItem('shaders-share-warning', 'true');
  }

  const path = await packShaders(config, titleID);
  electron.ipcRenderer.send('shadersBuffer', path);
  electron.ipcRenderer.on('uploaded', async (_, body) => {

    // IPC can trigger multiple time for same event, we just want to be sure it triggers only one time
    if (paths.includes(key)) {
      return false;
    }

    paths.push(key);

    const json = JSON.parse(body);
    const message = `Hey there, I'm sharing my shaders using emusak for **${GameName}** (${titleID.toUpperCase()}). I have ${localCount} shaders while emusak has ${emusakCount} shaders. Download them from here : \`${btoa(json.data.file.url.short)}\``;
    const response = await postEmusakShaderShare(message);
    try {
      rimraf(path, () => {});
    } catch(e) {}

    if (response.status === 200) {
      localStorage.setItem(key, 'true')
      await fs.promises.unlink(path);
      Swal.fire('success', 'You shaders has been submitted ! You can find them in #ryu-shaders channel. Once approved it will be shared to everyone !');
    } else {
      Swal.fire('error', 'You shared too many shaders !');
    }
  });

  electron.ipcRenderer.on('uploaded-fail', () => {
    Swal.fire('error', 'An error occured during the upload process :\'( please retry a bit later');
  })
}
