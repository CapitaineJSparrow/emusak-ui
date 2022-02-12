import HttpService from "../services/HttpService";
import fs from "fs-extra";
import path from "path";
import { BrowserWindow } from "electron";
import { EmusakEmulatorsKind } from "../../types";
import Zip from "adm-zip";

export type getModsVersionsProps = [string];

export type getModsListForVersionProps = [string, string];

export type downloadModProps = [string, string, string, string, EmusakEmulatorsKind];

export const getModsVersions = async (...args: getModsVersionsProps) => {
  const [titleId] = args;
  return HttpService.getVersionsForMod(titleId);
};

export const getModsListForVersion = async (...args: getModsListForVersionProps) => {
  const [titleId, modName] = args;
  return HttpService.getModsForVersion(titleId, modName);
};

export const downloadMod = async (mainWindow: BrowserWindow, ...args: downloadModProps): Promise<string> => {
  const [titleId, version, modName, dataPath, emulator] = args;
  const { response, name } = await HttpService.downloadMod(titleId, version, modName);
  let destPath = "";

  switch (emulator) {
    case "ryu":
      destPath = path.resolve(dataPath, "mods", "contents", titleId.toLocaleLowerCase());
      break;
    case "yuzu":
      destPath = path.resolve(dataPath, "load",titleId.toLocaleLowerCase());
  }

  await fs.ensureDir(destPath);
  const modDestPath = path.resolve(destPath, name);
  const fileStream = fs.createWriteStream(modDestPath);

  let bytes = 0;
  let lastEmittedEventTimestamp = 0;

  const result = await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    response.body.on("data", (chunk) => {
      bytes += chunk.length;
      const percentage = bytes / +(response.headers.get("content-length")) * 100;
      const currentTimestamp = +new Date();

      // Throttle event to 1 time every 100ms
      if (currentTimestamp - lastEmittedEventTimestamp >= 100) {
        mainWindow.webContents.send("download-progress", "mod", percentage.toFixed(2), modName);
        lastEmittedEventTimestamp = +new Date();
      }
    });
    fileStream.on("finish", () => resolve(dataPath));
  }).catch(() => null);

  if (!result) {
    return Promise.reject(new Error("Unable to retrieve file"));
  }

  const kind = name.toLowerCase().includes(".pchtxt") ? "pchtxt" : "archive";

  if (kind === "pchtxt") {
    await fs.ensureDir(path.resolve(destPath, modName,"exefs"));
    await fs.remove(path.resolve(destPath, modName, "exefs", name));
    await fs.move(modDestPath, path.resolve(destPath, modName, "exefs", name));
    await fs.chmod(path.resolve(destPath, modName, "exefs", name), 660);
    return destPath;
  }

  const archive = new Zip(modDestPath);
  archive.extractAllTo(path.resolve(modDestPath, ".."), true);
  await fs.remove(modDestPath);

  return destPath;
};
