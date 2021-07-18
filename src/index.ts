import { app, BrowserWindow, autoUpdater } from 'electron';
import isDev from "electron-is-dev";
import * as electron from "electron";
import * as fs from "fs";
import request from "request";
import rimraf from "rimraf";
import path from "path";
import child_process from "child_process";

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

(() => {
  const handleStartupEvent = function() {
    if (process.platform !== 'win32') {
      return false;
    }

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command: any, args: any) {
      let spawnedProcess;

      try {
        spawnedProcess = child_process.spawn(command, args, {detached: true});
      } catch (error) {}

      return spawnedProcess;
    };

    const spawnUpdate = function(args: any) {
      return spawn(updateDotExe, args);
    };

    const squirrelCommand = process.argv[1];
    switch (squirrelCommand) {
      case '--squirrel-install':
        spawnUpdate(['--createShortcut', exeName]);
        return false;
      case '--squirrel-updated':
        spawnUpdate(['--createShortcut', exeName]);
        setTimeout(app.quit, 1000);
        return true;
      case '--squirrel-uninstall':
        app.quit();
        const p = app.getPath('userData');
        try {
          rimraf.sync(p);
          fs.rmdirSync(p);
        } catch(e) {}
        spawnUpdate(['--removeShortcut', exeName]);
        return true;
      case '--squirrel-obsolete':
        app.quit();
        return true;
    }
  };

  if (handleStartupEvent()) {
    return false;
  }

  const feed = `https://update.electronjs.org/stromcon/emusak-ui/${process.platform}-${process.arch}/${app.getVersion()}`

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
  if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
  }

  app.commandLine.appendSwitch ("disable-http-cache");
  const gotTheLock = app.requestSingleInstanceLock()
  let mainWindow: BrowserWindow;

  const createWindow = (): void => {

    // Create the browser window.
    mainWindow = new BrowserWindow({
      minHeight: 960,
      minWidth: 1280,
      resizable: true,
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false
      }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.setSize(960, 1280);
      mainWindow.center();
      mainWindow.show()  // show the window now since everything is ready

      if (!isDev && process.platform === "win32") {
        autoUpdater.setFeedURL({
          url: feed
        });

        // Check updates every 10mn, and at startup
        setInterval(() => {
          autoUpdater.checkForUpdates()
        }, 10 * 60 * 1000)

        autoUpdater.checkForUpdates();

        autoUpdater.on('update-downloaded', () => mainWindow.webContents.send('update-downloaded'))
        autoUpdater.on('update-available', () => mainWindow.webContents.send('update-available'))
        electron.ipcMain.on('reboot-after-download', () => autoUpdater.quitAndInstall())
      }
    })
  };

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })

    app.on('ready', createWindow);
  }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

  let paths: string[] = [];

  electron.ipcMain.on('shadersBuffer', async(event, zipPath: string) => {

    if (paths.includes(zipPath)) {
      return;
    }

    paths.push(zipPath);
    const r = request.post('https://api.anonfiles.com/upload', (err, httpResponse, body) => {
      if (!err) {
        event.reply('uploaded', body);
      } else {
        event.reply('uploaded-fail');
      }
    })
    const form = r.form();
    form.append('file', fs.createReadStream(zipPath))
  });
})();
