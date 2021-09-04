import * as fs from "fs";
import path from "path";
import { downloadFirmwareWithProgress, downloadMod, getKeysContent } from "../../api/emusak";
import { IEmusakEmulatorConfig } from "../../types";
import electron from "electron";
import Swal from "sweetalert2";
import { asyncExtract } from "../utils";
import { readDir } from "../FService";
import Zip from "adm-zip";

const getYuzuPath = (config: IEmusakEmulatorConfig, ...paths: string[]) => {

  if (!(process.platform === "win32")) {
    return path.resolve(electron.remote.app.getPath('home'), '.local', 'share', 'yuzu', ...paths);
  }

  return path.resolve(electron.remote.app.getPath('appData'), 'yuzu', ...paths);
}

export const isValidFileSystem = async (): Promise<boolean> => {
  const yuzuAppDataPath = fs.promises.access(getYuzuPath(null)).then(() => true).catch(() => false);
  const firmwarePath = getYuzuPath(null, 'nand', 'system', 'Contents', 'registered');
  const keyPath = getYuzuPath(null, 'keys');

  const result = await Promise.all([
    yuzuAppDataPath,
    firmwarePath,
    keyPath
  ]);

  return !result.includes(false);
}

export const installKeysToYuzu = async () => {
  const keysContent = await getKeysContent();
  const keysPath = getYuzuPath(null, 'keys', 'prod.keys');
  await fs.promises.writeFile(keysPath, keysContent, 'utf-8');

  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    html: `Created or replaced keys at : <code>${keysPath}</code>`,
    width: 600
  });
};

export const installFirmware = async () => {
  const firmwareDestPath = path.resolve((electron.app || electron.remote.app).getPath('temp'), 'firmware.zip');
  const firmwareInstallPath = getYuzuPath(null, 'nand', 'system', 'Contents', 'registered');
  const result = await downloadFirmwareWithProgress(firmwareDestPath);

  if (!result) {
    return;
  }

  await asyncExtract(firmwareDestPath, firmwareInstallPath);
  await fs.promises.unlink(firmwareDestPath);
  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    html: `Extracted firmware content to ${firmwareInstallPath}`,
    width: 600
  });
}

export const getYuzuGames = async () => {

  if (!(process.platform === "win32")) {
    const loadPath = getYuzuPath(null, 'load');
    const dirents = await readDir(loadPath);
    const games = dirents.filter(d => d.isDirectory()).map(d => d.name.trim().toUpperCase());

    return games.map(g => ({
      id: g,
      shadersCount: 0
    }))
  }

  try {

    const cachePath = getYuzuPath(null, 'cache', 'game_list');
    const dirents = await readDir(cachePath);
    const files = dirents.filter(d => d.isFile()).map(d => d.name.replace('.pv.txt', '').toUpperCase());

    return files.map(f => ({
      id: f,
      shadersCount: 0
    }))
  } catch(e) {
    return false;
  }
}

export const installMod = async (titleID: string, pickedVersion: string, modName: string, modFileName: string) => {
  const kind = modFileName.toLowerCase().includes('.pchtxt') ? 'pchtxt' : 'archive';
  let modPath: string;

  if (kind === 'pchtxt') {
    modPath = getYuzuPath(null, 'load', titleID, modName, 'exefs');
  } else {
    modPath = getYuzuPath(null, 'load', titleID);
  }

  const exists = await fs.promises.access(modPath).then(() => true).catch(() => false);

  if (!exists) {
    await fs.promises.mkdir(modPath, { recursive: true });
  }

  const modBuffer = await downloadMod(titleID, pickedVersion, modName, modFileName);

  if (kind === 'pchtxt') {
    await fs.promises.writeFile(path.resolve(modPath, `${modName}.pchtxt`), modBuffer, 'utf-8');
    await fs.promises.chmod(path.resolve(modPath, `${modName}.pchtxt`), 660);
  } else {
    const archive = new Zip(modBuffer);
    archive.extractAllTo(modPath, true);
  }

  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    text: `Mod installed to ${modPath}`
  });
}
