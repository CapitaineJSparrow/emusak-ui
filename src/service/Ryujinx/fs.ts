import Swal from "sweetalert2";
import { pickOneFolder, readDir } from "../fs";
import RyujinxModel, { IRyujinxConfig } from "../../storage/ryujinx";
import { progressEvent } from "../../events";
import { httpRequestWithProgress } from "../HTTPService";
import * as electron from "electron";
import path from "path";
import { getKeysContent, PATHS } from "../../api/emusak";
import * as fs from "fs";

const isValidRyujinxFolder = async (path: string): Promise<boolean> => {
  const dirents = await readDir(path);
  const files = dirents.filter(d => d.isFile()).map(d => d.name);
  return files.includes('Ryujinx.exe') || files.includes('Ryujinx');
}

const isRyujinxPortableMode = async (path: string): Promise<boolean> => {
  const dirents = await readDir(path);
  const folders = dirents.filter(d => !d.isFile()).map(d => d.name.toLowerCase());
  return folders.includes('portable');
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
  RyujinxModel.addDirectory({ isPortable, path });
}

export const downloadFirmware = async () => {
  const firmwarePath = path.resolve((electron.app || electron.remote.app).getPath('documents'), 'firmware.zip');
  await httpRequestWithProgress(PATHS.FIRMWARE, null, firmwarePath, (progress: number) => {
    progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress, open: true } }));
  })

  progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress: 0, open: false }}));

  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    text: 'EmuSAK will now open the downloaded firmware location. Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file'
  });

  electron.shell.showItemInFolder(firmwarePath);
}

export const onKeysDownload = async (config: IRyujinxConfig) => {
  const keysContent = await getKeysContent();
  const prodKeysPath = getRyujinxPath(config, 'system', 'prod.keys');

  await fs.promises.writeFile(prodKeysPath, keysContent, 'utf-8');
  return Swal.fire({
    icon: 'success',
    title: 'Job done !',
    text: `Created or replaced keys at : ${prodKeysPath}`
  })
}
