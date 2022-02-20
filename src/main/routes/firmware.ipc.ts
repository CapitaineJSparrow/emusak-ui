import { EmusakEmulatorsKind } from "../../types";
import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs-extra";
import AdmZip from "adm-zip";
import HttpService, { HTTP_PATHS } from "../services/HttpService";


const installFirmware = async (emu: EmusakEmulatorsKind, dataPath: string, mainWindow: BrowserWindow) => {
  const destPath = path.resolve(app.getPath("temp"), "firmware.zip");

  try {
    const result = await HttpService.fetchWithProgress(HTTP_PATHS.FIRMWARE, destPath, mainWindow, "firmware.zip");

    if (!result) {
      return { error: true, code: "FETCH_FAILED" };
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

    return extractPath;
  } catch (_err) {
    console.log(_err);
    return { error: true, code: "FETCH_FAILED" };
  }
};

export default installFirmware;
