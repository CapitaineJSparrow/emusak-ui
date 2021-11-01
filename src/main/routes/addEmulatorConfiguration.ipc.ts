import { BrowserWindow, dialog, app } from "electron";
import * as path from "path";
import { EmusakEmulatorConfig, EmusakEmulatorsKind } from "../../types";

const addEmulatorConfigurationIpc = async (mainWindow: BrowserWindow) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'] });

  if (canceled) {
    return { error: true, code: 'OPERATION_CANCELED' };
  }

  const file = path.basename(filePaths[0]);

  // Should be "Ryujinx.exe" on windows and "Ryujinx" on linux
  if (!file.toLowerCase().includes('ryujinx')) {
    return { error: true, code: 'INVALID_RYUJINX_BINARY' };
  }

  return filePaths[0];
}

const createDefaultConfigForEmu = (emu: EmusakEmulatorsKind): EmusakEmulatorConfig => {
  if (emu === 'yuzu') {
    if (process.platform !== "win32") {
      return {
        path: path.resolve(app.getPath('home'), '.local', 'share', 'yuzu'),
        emulator: 'yuzu',
        name: 'Yuzu Global (default)'
      }
    }

    return {
      path: path.resolve(app.getPath('appData'), 'yuzu'),
      emulator: 'yuzu',
      name: 'Yuzu Global (default)'
    }
  }

  return {
    path: path.resolve(app.getPath('appData'), 'Ryujinx'),
    emulator: 'ryu',
    name: 'Ryujinx Global (default)'
  };
}

export {
  addEmulatorConfigurationIpc,
  createDefaultConfigForEmu
};
