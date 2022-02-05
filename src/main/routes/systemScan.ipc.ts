import path from "path";
import * as fs from "fs/promises";
import { app } from "electron";
import { EmusakEmulatorGames, EmusakEmulatorMode, EmusakEmulatorsKind } from "../../types";
import customDatabase from "../../assets/custom_database.json";
import tinfoilDatabase from "../../assets/tinfoildb.json";
import getEshopData from "../services/eshopData";

const tfDb: { [key: string]: string } = tinfoilDatabase;
const csDb: { [key: string]: string } = customDatabase;

const getRyujinxMode = async (binaryPath: string): Promise<EmusakEmulatorMode> => {
  const fitgirlDataPath = path.resolve(binaryPath, "..", "..", "data", "games");
  const isFitgirlRepack = await fs.stat(fitgirlDataPath).then(() => true).catch(() => false);

  if (isFitgirlRepack) {
    return {
      mode: "fitgirl",
      dataPath: fitgirlDataPath
    };
  }

  const portableDataPath = path.resolve(binaryPath, "..", "portable");
  const isPortable = await fs.stat(portableDataPath).then(() => true).catch(() => false);

  if (isPortable) {
    return {
      mode: "portable",
      dataPath: portableDataPath
    };
  }

  return {
    mode: "global",
    dataPath: path.resolve(app.getPath("appData"), "Ryujinx")
  };
};

const getYuzuMode = async (binaryPath: string): Promise<EmusakEmulatorMode> => {
  const portableDataPath = path.resolve(binaryPath, "..", "user");
  const isPortable = await fs.stat(portableDataPath).then(() => true).catch(() => false);

  if (isPortable) {
    return {
      mode: "portable",
      dataPath: portableDataPath
    };
  }

  return {
    mode: "global",
    dataPath: process.platform === "win32"
      ? path.resolve(app.getPath("appData"), "yuzu")
      : path.resolve(app.getPath("home"), ".local", "share", "yuzu")
  };
};

const systemScanIpc = async (kind: EmusakEmulatorsKind, binaryPath: string): Promise<EmusakEmulatorMode> => {
  if (kind === "yuzu") {
    return getYuzuMode(binaryPath);
  }

  return getRyujinxMode(binaryPath);
};

const scanGamesForConfig = async (dataPath: string, emu: EmusakEmulatorsKind): Promise<EmusakEmulatorGames> => {
  try {
    if (emu === "yuzu") {
      const windowsPath = path.join(dataPath, "cache", "game_list");
      const directories = await fs.readdir(process.platform === "win32" ? windowsPath : path.join(dataPath, "load"), { withFileTypes: true });
      return directories.map(d => d.name.toLowerCase().replace(".pv.txt", ""));
    }

    const directories = await fs.readdir(path.join(dataPath, "games"), { withFileTypes: true });
    return directories.filter(d => d.isDirectory()).map(d => d.name.toLowerCase());
  } catch(e) {
    return [];
  }
};

const buildMetadataForTitleId = async (titleId: string) => {
  const eData = await getEshopData();
  const keys = Object.keys(eData);
  const eshopEntry = keys.find((key) => eData[key]?.id?.toLowerCase() === titleId.toLowerCase());
  const id = titleId.toUpperCase();

  if (eshopEntry) {
    return {
      title: eData[eshopEntry].name,
      img: eData[eshopEntry].iconUrl,
      titleId: titleId.toUpperCase(),
    };
  }

  return {
    // Use custom database in priority, then database from tinfoil and fallback by returning only title ID in case game does not exists in eshop
    title: csDb[id.toUpperCase()] || tfDb[id.toUpperCase()] || titleId.toUpperCase(),
    img: "",
    titleId: titleId.toUpperCase(),
  };
};

export {
  systemScanIpc,
  scanGamesForConfig,
  buildMetadataForTitleId
};
