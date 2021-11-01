import path from "path";
import * as fs from "fs/promises";
import { app } from 'electron';
import { EmusakEmulatorMode, EmusakEmulatorsKind } from "../../types";

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

export default systemScanIpc;
