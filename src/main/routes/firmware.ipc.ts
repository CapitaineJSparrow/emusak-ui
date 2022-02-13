import { EmusakEmulatorsKind } from "../../types";
import fetch from "node-fetch";
import { app, BrowserWindow , ipcMain } from "electron";
import path from "path";
import fs from "fs-extra";
import AdmZip from "adm-zip";
import HttpService, { HTTP_PATHS } from "../services/HttpService";

let isDownloadingFirmware = false;

const installFirmware = async (emu: EmusakEmulatorsKind, dataPath: string, mainWindow: BrowserWindow) => {

  if (isDownloadingFirmware) {
    return false;
  }

  isDownloadingFirmware = true;
  const destPath = path.resolve(app.getPath("temp"), "firmware.zip");
  const exists = await fs.pathExists(destPath);

  // Remove previous firmware if already exists
  if (exists) {
    await fs.unlink(destPath);
  }

  const controller = new AbortController();
  const response = await fetch(new URL(HTTP_PATHS.FIRMWARE, HttpService.url).href, { signal: controller.signal });

  if (!response.ok) {
    isDownloadingFirmware = false;
    return { error: true, code: "FETCH_FAILED" };
  }

  try {
    let downloadedBytesLength = 0;
    const contentLength = +response.headers.get("Content-Length");
    let lastEmittedEventTimestamp = 0;
    let downloadSpeed = 0;
    const startTime = Date.now();
    ipcMain.on("cancel-download", (_, filename: string) => {
      if (filename !== "firmware.zip") return;
      controller.abort();
    });

    // Stream file to disk
    for await (const chunk of response.body) {
      downloadedBytesLength += chunk.length;
      downloadSpeed += chunk.length;
      const mbps = downloadedBytesLength / (1024 * 1024);
      downloadSpeed = Date.now() - startTime === 0 ? downloadSpeed : mbps / ((Date.now() - startTime) / 1000);
      const currentTimestamp = +new Date();

      // Throttle the dispatch event since loop is called many times
      if (currentTimestamp - lastEmittedEventTimestamp >= 100 || downloadedBytesLength === contentLength) {
        mainWindow.webContents.send("download-progress", "firmware", (downloadedBytesLength / contentLength * 100).toFixed(2), downloadSpeed.toFixed(2));
        lastEmittedEventTimestamp = +new Date();
      }

      const res: object | null = await fs.appendFile(destPath, chunk).catch(() => {
        controller.abort(); // Cancel download, writing file to disk is not possible (antivirus preventing emusak to write file ? Lack of space ?
        isDownloadingFirmware = false;
        return { error: true, code: "FETCH_FAILED" };
      }).then(() => null);

      if (res) {
        return res;
      }
    }

    const zip = new AdmZip(destPath);

    // Clear destination, extract and delete firmware
    const extractPath = path.join(dataPath, emu === "yuzu" ? "nand" : "bis", "system", "Contents", "registered");
    await fs.remove(extractPath);
    await fs.ensureDir(extractPath);
    zip.extractAllTo(extractPath, true);
    await fs.unlink(destPath);

    // In case of ryujinx, we need to create folders with same name as extracted files, suffix with ".nca" and move the file to this created folder and rename file to "00" for some reason
    if (emu === "ryu") {
      const files = await fs.readdir(extractPath);

      // We cannot do it using concurrency otherwise windows is giving perms issues
      for (const file of files) {
        // 1. Rename file to "00"
        await fs.rename(path.join(extractPath, file), path.join(extractPath, "00"));
        // 2. Create directory with same name as file without .cnmt
        await fs.ensureDir(path.join(extractPath, file.replace(".cnmt", "")));
        // 3. Move file to created directory
        await fs.rename(path.join(extractPath, "00"), path.join(extractPath, file.replace(".cnmt", ""), "00"));
      }
    }

    isDownloadingFirmware = false;
    return extractPath;
  } catch (_err) {
    console.log(_err);
    isDownloadingFirmware = false;
    return { error: true, code: "FETCH_FAILED" };
  }
};

export default installFirmware;
