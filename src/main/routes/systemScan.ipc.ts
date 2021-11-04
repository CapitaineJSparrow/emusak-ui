import path from "path";
import * as fs from "fs/promises";
import { app } from 'electron';
import { EmusakEmulatorGames, EmusakEmulatorMode, EmusakEmulatorsKind } from "../../types";
import eshopData from '../../assets/US.en.json';
import customDatabase from '../../assets/custom_database.json';

const getRyujinxMode = async (binaryPath: string): Promise<EmusakEmulatorMode> => {
  const fitgirlDataPath = path.resolve(binaryPath, '..', '..', 'data', 'games');
  const isFitgirlRepack = await fs.stat(fitgirlDataPath).then(() => true).catch(() => false);

  if (isFitgirlRepack) {
    return {
      mode: 'fitgirl',
      dataPath: fitgirlDataPath
    };
  }

  const portableDataPath = path.resolve(binaryPath, '..', 'portable');
  const isPortable = await fs.stat(portableDataPath).then(() => true).catch(() => false);

  if (isPortable) {
    return {
      mode: 'portable',
      dataPath: portableDataPath
    }
  }

  return {
    mode: 'global',
    dataPath: path.resolve(app.getPath('appData'), 'Ryujinx')
  }
}

const getYuzuMode = async (binaryPath: string): Promise<EmusakEmulatorMode> => {
  const portableDataPath = path.resolve(binaryPath, '..', 'user');
  const isPortable = await fs.stat(portableDataPath).then(() => true).catch(() => false);

  if (isPortable) {
    return {
      mode: 'portable',
      dataPath: portableDataPath
    }
  }

  return {
    mode: 'global',
    dataPath: path.resolve(app.getPath('appData'), 'yuzu')
  }
}

const systemScanIpc = async (kind: EmusakEmulatorsKind, binaryPath: string): Promise<EmusakEmulatorMode> => {
  if (!binaryPath) {
    throw new Error('You must pass binaryPath');
  }

  if (kind === 'yuzu') {
    return getYuzuMode(binaryPath);
  }

  return getRyujinxMode(binaryPath);
}

const scanGamesForConfig = async (dataPath: string, emu: EmusakEmulatorsKind): Promise<EmusakEmulatorGames> => {
  try {
    if (emu === 'yuzu') {
      const directories = await fs.readdir(path.join(dataPath, 'cache', 'game_list'), { withFileTypes: true });
      return directories.filter(d => d.isFile()).map(d => d.name.toLowerCase().replace('.pv.txt', ''));
    }

    const directories = await fs.readdir(path.join(dataPath, 'games'), { withFileTypes: true });
    return directories.filter(d => d.isDirectory()).map(d => d.name.toLowerCase());
  } catch(e) {
    return [];
  }
}

const buildMetadataForTitleId = async (titleId: string) => {
  try {
    const data = eshopData as {
      [key: string]: {
        id: string,
        name: string,
        iconUrl: string,
      }
    };
    const keys = Object.keys(eshopData);
    const item = keys.find((key) => data[key]?.id?.toLowerCase() === titleId.toLowerCase());
    return {
      title: data[item].name,
      img: data[item].iconUrl,
    }
  } catch(e) {
    return {
      title: (customDatabase as { [key: string]: string })[titleId.toUpperCase()] || titleId,
      img: ''
    }
  }
}

export {
  systemScanIpc,
  scanGamesForConfig,
  buildMetadataForTitleId
};
