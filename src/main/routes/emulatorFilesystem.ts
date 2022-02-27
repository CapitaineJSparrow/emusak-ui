import path from "path";
import { app, dialog } from "electron";
import { EmusakEmulatorGames, EmusakEmulatorMode, EmusakEmulatorsKind } from "../../types";
import customDatabase from "../../assets/custom_database.json";
import tinfoilDatabase from "../../assets/tinfoildb.json";
import getEshopData from "../services/eshopData";
import { getModPathForTitleId } from "./modsDownload";
import fs from "fs-extra";

const tfDb: typeof tinfoilDatabase = tinfoilDatabase;
const csDb: typeof customDatabase = customDatabase;

export const getRyujinxMode = async (binaryPath: string): Promise<EmusakEmulatorMode> => {
  const fitgirlDataPath = path.resolve(binaryPath, "..", "..", "data", "games");
  const isFitgirlRepack = await fs.stat(fitgirlDataPath).then(() => true).catch(() => false);

  if (isFitgirlRepack) {
    dialog.showMessageBox({
      title: "Fitgirl strikes again",
      message: "EmuSAK does not support Fitgirl repacks, please setup Ryujinx yourself and delete this configuration.",
      type: "error",
      buttons: ["Ok"],
    });
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

export const emulatorFilesystem = async (kind: EmusakEmulatorsKind, binaryPath: string): Promise<EmusakEmulatorMode> => {
  if (kind === "yuzu") {
    return getYuzuMode(binaryPath);
  }

  return getRyujinxMode(binaryPath);
};

export const scanGamesForConfig = async (dataPath: string, emu: EmusakEmulatorsKind): Promise<EmusakEmulatorGames> => {
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

export type deleteGameProps = [string, string, EmusakEmulatorsKind];

export const deleteGame = async (...args: deleteGameProps) => {
  const [titleId, dataPath, emulator] = args;
  const pathsToRemove: string[] = [];

  if (emulator === "ryu") {
    pathsToRemove.push(getModPathForTitleId(titleId, dataPath));
    pathsToRemove.push(path.resolve(dataPath, "games", titleId.toLowerCase()));
  } else {
    pathsToRemove.push(path.resolve(dataPath, "load", titleId.toUpperCase()));
    pathsToRemove.push(path.resolve(dataPath, "cache", "game_list", `${titleId.toLowerCase()}.pv.txt`));
    pathsToRemove.push(path.resolve(dataPath, "cache", "games", titleId.toLowerCase()));
    pathsToRemove.push(path.resolve(dataPath, "cache", "games", titleId.toUpperCase()));
    pathsToRemove.push(path.resolve(dataPath, "shader", titleId.toLocaleLowerCase()));
  }

  // Do this sequentially, in my experience FS does not like concurrent actions
  for (const path of pathsToRemove) {
    await fs.remove(path).catch(() => null);
  }
};

export const buildMetadataForTitleId = async (titleId: string): Promise<{ title: string, img: string, titleId: string }> => {
  const eData = await getEshopData();
  const keys = Object.keys(eData);
  const eshopEntry = keys.find((key) => eData[key]?.id?.toLowerCase() === titleId.toLowerCase());
  const id = <keyof typeof customDatabase & keyof typeof tinfoilDatabase> titleId.toUpperCase();

  if (eshopEntry) {
    return {
      title: eData[eshopEntry].name.replace("™", ""),
      img: eData[eshopEntry].iconUrl,
      titleId: titleId.toUpperCase(),
    };
  }

  const nonEshopData = {
    // Use custom database in priority, then database from tinfoil and fallback by returning only title ID in case game does not exists in eshop
    title: (csDb[id]) || tfDb[id] || titleId.toUpperCase(),
    img: "",
    titleId: titleId.toUpperCase(),
  };

  // Try to perform a search by name instead title ID in case it's not found
  if (!eshopEntry) {
    const eshopEntryByName = keys.find((key) => eData[key]?.name?.toLowerCase().replace("™", "").includes(nonEshopData.title.toLowerCase()));

    if (eshopEntryByName) {
      return {
        title: nonEshopData.title.toLowerCase(),
        img: eData[eshopEntryByName].iconUrl,
        titleId: titleId.toUpperCase(),
      };
    }
  }

  return nonEshopData;
};
