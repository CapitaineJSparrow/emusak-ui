import { app, ipcMain, BrowserWindow } from "electron";
import loadComponentIpcHandler, { loadComponentsProps } from "./loadComponent.ipc";
import titleBarIpc from "./titleBar.ipc";
import {
  emulatorFilesystem,
  scanGamesForConfig,
  buildMetadataForTitleId,
  deleteGameProps,
  deleteGame
} from "./emulatorFilesystem";
import { EmusakEmulatorsKind } from "../../types";
import { addEmulatorConfigurationIpc, createDefaultConfigActionForEmu } from "./addEmulatorConfiguration.ipc";
import installFirmware from "./firmware.ipc";
import { installKeys } from "./installKeys";
import updateEshopData from "./eshopData.ipc";
import openFolderForGame, { openFolderIPCProps } from "./openFolderForGame";
import ryujinxCompatibility, { ryujinxCompatibilityProps } from "./ryujinxCompatibility";
import savesDownloads, { downloadSaveProps } from "./savesDownload";
import {
  downloadMod,
  downloadModProps,
  getModsListForVersion,
  getModsListForVersionProps,
  getModsVersions,
  getModsVersionsProps
} from "./modsDownload";
import { countShaders, countShadersProps, installShaders, installShadersProps, shareShaders } from "./shaders";
import { toggleCustomDnsResolver } from "./dns.ipc";
import { hasDnsFile } from "../../index";
import { searchGameBana, searchProps } from "./gamebanana";

const makeIpcRoutes = (mainWindow: BrowserWindow) => {
  ipcMain.handle("load-components", async (_, ...args: loadComponentsProps) => loadComponentIpcHandler(...args));
  ipcMain.handle("get-app-version", async () => app.getVersion());
  ipcMain.handle("title-bar-action", async (_, action: "maximize" | "close" | "minimize") => titleBarIpc(action, mainWindow));
  ipcMain.handle("add-emulator-folder", async (_, emuKind: EmusakEmulatorsKind) => addEmulatorConfigurationIpc(mainWindow, emuKind));
  ipcMain.handle("system-scan-for-config", async (_, emuKind: EmusakEmulatorsKind, path: string) => emulatorFilesystem(emuKind, path));
  ipcMain.handle("build-default-emu-config", async (_, emu: EmusakEmulatorsKind) => createDefaultConfigActionForEmu(emu));
  ipcMain.handle("scan-games", async (_, dataPath: string, emu: EmusakEmulatorsKind) => scanGamesForConfig(dataPath, emu));
  ipcMain.handle("build-metadata-from-titleId", async (_, titleId: string) => buildMetadataForTitleId(titleId));
  ipcMain.handle("install-firmware", async (event, emu: EmusakEmulatorsKind, dataPath: string) => installFirmware(emu, dataPath, mainWindow));
  ipcMain.handle("install-keys", async (_, dataPath: string, emu: EmusakEmulatorsKind) => installKeys(dataPath, emu));
  ipcMain.handle("update-eshop-data", async () => updateEshopData());
  ipcMain.handle("openFolderForGame", async (_, ...args: openFolderIPCProps) => openFolderForGame(...args));
  ipcMain.handle("getRyujinxCompatibility", async (_, ...args: ryujinxCompatibilityProps) => ryujinxCompatibility(...args));
  ipcMain.handle("downloadSave", async (_, ...args: downloadSaveProps) => savesDownloads(...args));
  ipcMain.handle("get-mods-versions", async(_, ...args: getModsVersionsProps) => getModsVersions(...args));
  ipcMain.handle("get-mods-list-for-version", async(_, ...args: getModsListForVersionProps) => getModsListForVersion(...args));
  ipcMain.handle("download-mod", async(_, ...args: downloadModProps) => downloadMod(mainWindow, ...args));
  ipcMain.handle("count-shaders", async (_, ...args: countShadersProps) => countShaders(...args));
  ipcMain.handle("install-shaders", async (_, ...args: installShadersProps) => installShaders(mainWindow, ...args));
  ipcMain.handle("share-shaders", async (_, ...args: shareShaders) => shareShaders(mainWindow, ...args));
  ipcMain.handle("toggle-custom-dns", async () => toggleCustomDnsResolver());
  ipcMain.handle("has-dns-file", async () => hasDnsFile);
  ipcMain.handle("search-gamebanana", async (_, ...args: searchProps) => searchGameBana(...args));
  ipcMain.handle("delete-game", (_, ...args: deleteGameProps) => deleteGame(...args));
};

export default makeIpcRoutes;
