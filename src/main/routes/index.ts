import { app, ipcMain, BrowserWindow } from "electron";
import loadComponentIpcHandler from "./loadComponent.ipc";
import titleBarIpc from "./titleBar.ipc";
import { systemScanIpc, scanGamesForConfig, buildMetadataForTitleId } from "./systemScan.ipc";
import { EmusakEmulatorsKind } from "../../types";
import { addEmulatorConfigurationIpc, createDefaultConfigActionForEmu } from "./addEmulatorConfiguration.ipc";

const makeIpcRoutes = (mainWindow: BrowserWindow) => {
  ipcMain.handle('load-components', loadComponentIpcHandler);
  ipcMain.handle('get-app-version', async () => app.getVersion());
  ipcMain.handle('title-bar-action', async (_, action: 'maximize' | 'close' | 'minimize') => titleBarIpc(action, mainWindow));
  ipcMain.handle('add-emulator-folder', async (_, emuKind: EmusakEmulatorsKind) => addEmulatorConfigurationIpc(mainWindow, emuKind));
  ipcMain.handle('system-scan-for-config', async (_, emuKind: EmusakEmulatorsKind, path: string) => systemScanIpc(emuKind, path));
  ipcMain.handle('build-default-emu-config', async (_, emu: EmusakEmulatorsKind) => createDefaultConfigActionForEmu(emu));
  ipcMain.handle('scan-games', async (_, dataPath: string, emu: EmusakEmulatorsKind) => scanGamesForConfig(dataPath, emu));
  ipcMain.handle('build-metadata-from-titleId', async (_, titleId: string) => buildMetadataForTitleId(titleId));
};

export default makeIpcRoutes;
