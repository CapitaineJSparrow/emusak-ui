import { app, BrowserWindow } from "electron";

const titleBarIpc = async (action: 'maximize' | 'close' | 'minimize', mainWindow: BrowserWindow) => {
  switch (action) {
    case 'maximize':
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
        mainWindow.setSize(1280, 860);
        mainWindow.center();
      } else {
        mainWindow.maximize();
      }
      break;
    case 'close':
      app.quit();
      break;
    case 'minimize':
      mainWindow.minimize();
      break;
  }
}

export default titleBarIpc;
