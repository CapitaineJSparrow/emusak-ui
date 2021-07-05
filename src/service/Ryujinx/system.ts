import Swal from "sweetalert2";
import { pickOneFolder, readDir } from "../FService";
import RyujinxModel from "../../storage/ryujinx";
import * as electron from "electron";
import path from "path";
import { downloadFirmwareWithProgress, getKeysContent } from "../../api/emusak";
import * as fs from "fs";
import { IEmusakEmulatorConfig, IRyujinxConfig } from "../../types";
import { countShadersFromGames } from "./shaders";

/**
 * On linux, "Ryujinx" binary has no extension
 */
const isValidRyujinxFolder = async (path: string): Promise<boolean> => {
  const dirents = await readDir(path);
  const files = dirents.filter(d => d.isFile()).map(d => d.name);
  return files.includes('Ryujinx.exe') || files.includes('Ryujinx');
}

/**
 * Support either portable mode when or standard (%appdata%) ryu file system
 */
export const isRyujinxPortableMode = async (path: string): Promise<boolean> => {
  const dirents = await readDir(path);
  const folders = dirents.filter(d => !d.isFile()).map(d => d.name.toLowerCase());
  return folders.includes('portable');
}

/**
 * Util function to get path in same way if ryu is portable or not
 */
export const getRyujinxPath = (config: IRyujinxConfig, ...paths: string[]): string => {
  if (config.isPortable) {
    return path.resolve(config.path, 'portable', ...paths);
  }

  return path.resolve(electron.remote.app.getPath('appData'), 'Ryujinx', ...paths);
}

export const addRyujinxFolder = async () => {
  const { value: accept } = await Swal.fire({
    icon: 'info',
    text: 'You must pick a valid Ryujinx folder where "Ryujinx.exe" or "Ryujinx" (for linux users) is located. If you are using portable mode, you can add multiple Ryujinx instances by clicking again this button',
    showCancelButton: true,
    cancelButtonText: 'later'
  });

  if (!accept) {
    return false;
  }

  const path = await pickOneFolder();

  if (!path) {
    return false;
  }

  const isValid = await isValidRyujinxFolder(path);
  if (!isValid) {
    await Swal.fire({
      icon: 'error',
      text: '"Ryujinx.exe" or "Ryujinx" (for linux users) was not found in this location'
    });
    return false
  }

  const isPortable = await isRyujinxPortableMode(path);
  await RyujinxModel.addDirectory({ isPortable, path });
}

export const installFirmware = async () => {
  const firmwareDestPath = path.resolve((electron.app || electron.remote.app).getPath('documents'), 'firmware.zip');
  const result = await downloadFirmwareWithProgress(firmwareDestPath);

  if (!result) {
    return;
  }

  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    text: 'EmuSAK will now open the downloaded firmware location. Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file'
  });

  electron.shell.showItemInFolder(firmwareDestPath);
}

export const onKeysDownload = async (config: IRyujinxConfig, withAlert = true) => {
  const keysContent = await getKeysContent();
  const systemPath = getRyujinxPath(config, 'system');
  const exists = await fs.promises.stat(systemPath).catch(() => null);

  if (!exists) {
    await fs.promises.mkdir(systemPath);
  }

  const prodKeysPath = path.resolve(systemPath, 'prod.keys');

  await fs.promises.writeFile(prodKeysPath, keysContent, 'utf-8');

  if (withAlert) {
    await Swal.fire({
      icon: 'success',
      title: 'Job done !',
      html: `Created or replaced keys at : <code>${prodKeysPath}</code>`,
      width: 600
    });
  }

  return true;
}

export const listGamesWithNameAndShadersCount = async (configs: IRyujinxConfig[]): Promise<IEmusakEmulatorConfig[]> => Promise.all(configs.map(async config => {
  const gameDirectory = getRyujinxPath(config, 'games');
  const exists = await fs.promises.stat(gameDirectory).catch(() => null);

  if (!exists) {
    return {
      path: config.path,
      isPortable: config.isPortable,
      games: []
    }
  }

  const titleIds: any[] = (await readDir(gameDirectory)).filter(d => !d.isFile()).map(d => d.name.toUpperCase());
  const shadersCount = await countShadersFromGames(titleIds, config);

  return {
    path: config.path,
    isPortable: config.isPortable,
    games: titleIds.map((id, index) => ({
      id,
      shadersCount: shadersCount[index]
    }))
  }
}));

export const makeRyujinxPortable = async (config: IRyujinxConfig) => {
  const portableDirectoryPath = path.resolve(config.path, 'portable');
  const exists = await fs.promises.stat(portableDirectoryPath).catch(() => null);

  if (exists) {
    return true;
  }

  await fs.promises.mkdir(portableDirectoryPath);
  await Swal.fire({
    icon: 'success',
    // html: `Emusak created a "portable" directory at <code>${portableDirectoryPath}</code> and installed keys. Ryujinx will create the filesystem structures at this location when you launch any game next time, so please run a game and use the "reload" button (near the filter search) or relaunch emusak then. You will also need to re-install firmware : Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file (or use the "download firmware button" if you don't have archive yet)`
    html: `<ul style="list-style: none; text-align: left">
        <li><b style="color: #2ecc71; font-size: 1.4em">✓</b> Emusak created a "portable" directory at <code>${portableDirectoryPath}</code></li>
        <li><b style="color: #2ecc71; font-size: 1.4em">✓</b> Emusak downloaded keys</li>
        <li><b style="color: #3498db; font-size: 1.4em">?</b> You'll need to install firmware again, if you don't have firmware archive use the "Download firmware" button then : Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file</li>
        <li><b style="color: #3498db; font-size: 1.4em">?</b> You configuration is now empty, Go to "options" ⇾ settings and update your settings again (such as controllers or game directories)</li>
        <li><b style="color: #3498db; font-size: 1.4em">?</b> Ryujinx will create the right file structure in portable directory when you run any game next time, so launch any title and either restart emusak or use the reload button near the filter input</li>
        <li><b style="color: #2ecc71; font-size: 1.4em">✓</b> To revert this changes, just delete the portable directory</li>
    </ul>`
  });

  await onKeysDownload({
    ...config,
    isPortable: true
  }, false);
}
