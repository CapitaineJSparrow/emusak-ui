import fs from "fs-extra";
import path from "path";
import zip from "adm-zip";
import HttpService from "../services/HttpService";
import { BrowserWindow, ipcMain } from "electron";

export type countShadersProps = [string, string];

export type installShadersProps = [string, string];

export const countShaders = async (...args: countShadersProps): Promise<number> => {
  const [titleId, dataPath] = args;
  const shaderZipPath = path.resolve(dataPath, "games", titleId.toLocaleLowerCase(), "cache", "shader", "guest", "program", "cache.zip");
  const shaderExists = await fs
    .access(shaderZipPath)
    .then(() => true)
    .catch(() => false);

  if (!shaderExists) {
    return 0;
  }

  try {
    const archive = new zip(shaderZipPath);
    return archive.getEntries().length;
  } catch(e) {
    return 0;
  }
};

export const installShaders = async (mainWindow: BrowserWindow, ...args: installShadersProps): Promise<boolean> => {
  const [titleId, dataPath] = args;
  const controller = new AbortController();
  const shaderDestPath = path.resolve(dataPath, "games", titleId.toLowerCase(), "cache", "shader", "guest", "program", "cache.zip");
  const infoDestPath = path.resolve(dataPath, "games", titleId.toLowerCase(), "cache", "shader", "guest", "program", "cache.info");
  const exists = await fs.promises.access(infoDestPath).then(() => true).catch(() => false);

  if (!exists) {
    await fs.promises.mkdir(path.resolve(infoDestPath, ".."), { recursive: true });
  }

  const infoBuffer = await HttpService.downloadShaderInfo(titleId.toUpperCase()) as unknown as ArrayBuffer;

  if (!infoBuffer) {
    return null;
  }

  try {
    await fs.remove(path.resolve(dataPath, "games", titleId.toLowerCase(), "cache", "shader", "opengl"));
    await fs.writeFile(infoDestPath, Buffer.from(infoBuffer));
  } catch(e) {
    console.error(e);
    return null;
  }

  ipcMain.on("cancel-download", (_, filename: string) => {
    console.log(filename);
    if (filename !== titleId) return;
    controller.abort();
  });

  const response = await HttpService.downloadShaderZip(titleId.toUpperCase(), controller) as unknown as Response & { body: NodeJS.ReadableStream };
  const fileStream = fs.createWriteStream(shaderDestPath);
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
        mainWindow.webContents.send("download-progress", titleId, percentage.toFixed(2));
        lastEmittedEventTimestamp = +new Date();
      }
    });
    fileStream.on("finish", () => resolve(dataPath));
  }).catch(() => null);

  if (!result) {
    return null;
  }

  await fs.emptyDir(path.resolve(dataPath, "games", titleId.toLowerCase(), "cache", "shader", "opengl"));

  return true;
};
