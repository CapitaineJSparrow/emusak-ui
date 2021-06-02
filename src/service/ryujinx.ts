import path from "path";
import {IRyujinxConfig} from "../model/RyujinxModel";
import {listDirectories} from "./fs";
import * as electron from "electron";
import * as fs from "fs";
import zip from "adm-zip";
import {getEmusakProdKeys, PATHS, postEmusakShaderShare} from "../api/emusak";
import Swal from "sweetalert2";
import rimraf from "rimraf";
import { spawn } from "child_process";
import { downloadFileWithProgress } from "./http";

export interface IryujinxLocalShaderConfig {
  titleID: string;
  count: number;
}

const paths: string[] = [];

const asyncZipWrite = (archive: zip, path: string): Promise<void> => new Promise((resolve) => {
  archive.writeZip(path, () => resolve());
});

const getRyujinxPath = (config: IRyujinxConfig, ...paths: string[]): string => {
  let dir;

  if (config.isPortable) {
    dir = path.resolve(config.path, 'portable', ...paths);
  } else {
    dir = path.resolve((electron.app || electron.remote.app).getPath('appData'), 'Ryujinx', ...paths);
  }

  return dir;
}

export const readGameList = async (config: IRyujinxConfig) => {
  let gamesDirectory = getRyujinxPath(config, 'games');
  return (await listDirectories(gamesDirectory)).map(titleId => titleId.toLowerCase());
}

export const countShaderForGame = async (config: IRyujinxConfig, titleID: string): Promise<IryujinxLocalShaderConfig> => {
  let shaderZipPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');

  const exists = await fs.promises.access(shaderZipPath).then(() => true).catch(() => false);
  let count = 0;

  if (exists) { // To get shaders count, we just have to count files in zip archive
    try {
      const archive = new zip(shaderZipPath);
      count = archive.getEntries().length;
    } catch (e) {
    }
  }

  return {
    titleID,
    count
  };
}

export const downloadKeys = async (config: IRyujinxConfig): Promise<any> => {
  const file = await getEmusakProdKeys();
  let prodKeysPath = getRyujinxPath(config, 'system', 'prod.keys');

  await fs.promises.writeFile(prodKeysPath, file, 'utf-8');
  return Swal.fire({
    icon: 'success',
    title: 'Job done !',
    text: `Created or replaced keys at : ${prodKeysPath}`
  })
}

export const downloadInfo = async (config: IRyujinxConfig, titleID: string): Promise<any> => {
  let shaderInfoPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program');

  const exists = await fs.promises.access(shaderInfoPath).then(() => true).catch(() => false);

  if (!exists) {
    await fs.promises.mkdir(shaderInfoPath, {recursive: true});
  }

  return downloadFileWithProgress({
    filePath: path.resolve(shaderInfoPath, 'cache.info'),
    url: `/ryu/${titleID.toUpperCase()}.info`,
    fromCdn: true,
  });
}

export const downloadShaders = async (config: IRyujinxConfig, titleID: string, progressCallback?: Function): Promise<any> => {
  let shaderZipPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  rimraf(getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'opengl'), () => {});

  return downloadFileWithProgress({
    progressCallback,
    filePath: shaderZipPath,
    url: `/ryu/${titleID.toUpperCase()}.zip`,
    fromCdn: true
  });
}

export const downloadFirmwareWithProgress = async (progressCallback: Function): Promise<void> => {
  const filename = 'firmware.zip';
  const firmwarePath = path.resolve((electron.app || electron.remote.app).getPath('documents'), filename);
  await downloadFileWithProgress({
    progressCallback,
    filePath: firmwarePath,
    url: PATHS.FIRMWARE_DOWNLOAD,
    fromCdn: true
  });
  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    text: 'EmuSAK will now open the downloaded firmware location. Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file'
  })
  electron.shell.showItemInFolder(firmwarePath);
}

export const downloadSaveWithProgress = async (progressCallback: Function, titleId: string, filename: string) : Promise<void> => {
  const url = `/saves/${titleId}/${encodeURIComponent(filename)}`;
  const savePath = path.resolve((electron.app || electron.remote.app).getPath('documents'), filename);

  await downloadFileWithProgress({
    progressCallback,
    filePath: savePath,
    url,
    fromCdn: true
  });

  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    text: 'EmuSAK will now open the downloaded save location. Go to ryujinx ⇾ Right click on the game ⇾ "Open User Save directory" and extract files here !'
  })
  electron.shell.showItemInFolder(savePath);
}

export const packShaders = async (config: IRyujinxConfig, titleID: string): Promise<any> => {
  const shaderZipPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  const shaderInfoPath = getRyujinxPath(config, 'games', titleID, 'cache', 'shader', 'guest', 'program', 'cache.info');
  const archive = new zip();
  archive.addLocalFile(shaderZipPath);
  archive.addLocalFile(shaderInfoPath);

  const zipPath = path.resolve(shaderInfoPath, '..', 'upload.zip');
  await asyncZipWrite(archive, zipPath);

  return zipPath;
}

const asyncReadRyujinxProcess = async (ryuBinPath: string): Promise<any> => new Promise((resolve, reject) => {
  const child = spawn(ryuBinPath);
  let fullData = '';
  let ranTitleId: string;
  let compiledShadersCount: number;
  let ranTitleVersion: string;

  child.on('exit', () => resolve(false));
  child.stdout.on('data', (data) => {
    fullData += data;
    const titleIdMatch = /for Title (.+)/gi.exec(fullData);
    const shaderCountMatch = /Shader cache loaded (\d+) entries/gi.exec(fullData);
    const titleVersionMatch = /v([\d+\.]+) \[/.exec(fullData);

    if (titleVersionMatch && titleVersionMatch.length >= 2) {
      ranTitleVersion = titleVersionMatch[1];
    }

    if (titleIdMatch && titleIdMatch.length >= 2) {
      ranTitleId = titleIdMatch[1].trim();
    }

    if (shaderCountMatch && shaderCountMatch.length >= 2) {
      compiledShadersCount = parseInt(shaderCountMatch[1].trim());
    }

    if (ranTitleId && (compiledShadersCount || compiledShadersCount === 0)) {
      resolve({ ranTitleId, compiledShadersCount, ranTitleVersion });
      child.kill();
    }
  });
  child.stdout.on('error', () => reject(false));
})

const updateConfig = (conf: any) => {
  conf['logging_enable_error'] = true;
  conf['logging_enable_guest'] = true;
  conf['logging_enable_info'] = true;
  conf['logging_enable_stub'] = true;
  conf['logging_enable_warn'] = true;
  conf['logging_enable_fs_access_log'] = true;
  return conf;
}

export const shareShader = async (
  config: IRyujinxConfig,
  titleID: string,
  gameName: string,
  localCount: number = 0,
  emusakCount: number = 0,
  onRyujinxOpen: Function,
  onRyujinxClose: Function,
  done: Function
) => {

  const key = `ryu-share-${titleID}-${localCount}`;

  if (localStorage.getItem(key)) {
    Swal.fire({
      icon: 'error',
      title: 'error',
      text: 'You already shared those shaders, thanks !'
    });
    return false;
  }

  const { value } = await Swal.fire({
    icon: "info",
    html: `To be sure your submission is valid, emusak will do a sanity check. Ryujinx will be open and you'll have to run <b>${gameName}</b> to make sure no errors are encountered while compiling shaders before share them to everyone. <br /> <br /> <b style="color: #e74c3c">Please close any opened Ryujinx instance before continue</b>. Emusak will automatically close Ryujinx when shaders compilation is finished`,
    confirmButtonText: "I'm ready, let's go !",
    cancelButtonText: "Later",
    showCancelButton: true
  });

  if (!value) {
    return;
  }

  const ldnConfigPath = getRyujinxPath(config, 'LDNConfig.json');
  const hasLdnConfigFile = await fs.promises.access(ldnConfigPath).then(() => true).catch(() => false);
  const standardConfigPath = getRyujinxPath(config, 'Config.json');
  const hasStandardConfigFile = await fs.promises.access(standardConfigPath).then(() => true).catch(() => false);

  if (hasLdnConfigFile) {
    let ryujinxConfig = JSON.parse((await fs.promises.readFile(ldnConfigPath)).toString());
    ryujinxConfig = updateConfig(ryujinxConfig);
    await fs.promises.writeFile(ldnConfigPath, JSON.stringify(ryujinxConfig, null, 2), 'utf-8');
  }

  if (hasStandardConfigFile) {
    let ryujinxConfig = JSON.parse((await fs.promises.readFile(standardConfigPath)).toString());
    ryujinxConfig = updateConfig(ryujinxConfig);
    await fs.promises.writeFile(standardConfigPath, JSON.stringify(ryujinxConfig, null, 2), 'utf-8');
  }

  let ryuBinary = path.resolve(config.path, 'Ryujinx.exe');

  if (process.platform !== "win32") {
    ryuBinary = path.resolve(config.path, 'Ryujinx')
  }

  onRyujinxOpen();
  const result = await asyncReadRyujinxProcess(ryuBinary).catch(() => false);
  onRyujinxClose();

  if (!result) {
    done();
    await Swal.fire({
      icon: 'error',
      text: 'You either closed Ryujinx before running the game or Ryujinx crashed'
    })
    return;
  }

  if (result.ranTitleId !== titleID.toUpperCase()) {
    done();
    await Swal.fire({
      icon: 'error',
      text: `You ran the wrong game ! You had to launch ${gameName}`
    })
    return;
  }

  if (result.compiledShadersCount !== localCount) {
    done();
    await Swal.fire({
      icon: 'error',
      text: `You have ${localCount} on your cache but Ryujinx compiled ${result.compiledShadersCount}. That means some shaders are either corrupted or rejected. This probably not your fault, that maybe means you build shaders since a long time ago and Ryujinx choose to reject them because they changed something in the code and the game probably run fine. But because we share shaders to everyone, we choose to reject your submission to avoid any conflict because we are not sure at 100% this will not cause issue to anyone`
    })
    return;
  }

  const shadersPath = await packShaders(config, titleID);
  electron.ipcRenderer.send('shadersBuffer', shadersPath);
  electron.ipcRenderer.on('uploaded', async (_, body) => {

    // IPC can trigger multiple time for same event, we just want to be sure it triggers only one time
    if (paths.includes(key)) {
      done();
      return false;
    }

    paths.push(key);

    const json = JSON.parse(body);
    const message = `Hey there, I'm sharing my shaders using emusak for **${gameName}** v${result.ranTitleVersion} (${titleID.toUpperCase()}). I have ${localCount} shaders while emusak has ${emusakCount} shaders. Download them from here : \`${btoa(json.data.file.url.short)}\``;
    const response = await postEmusakShaderShare(message);
    try {
      rimraf(shadersPath, () => {});
    } catch(e) {}

    done();
    if (response.status === 200) {
      localStorage.setItem(key, 'true')
      await fs.promises.unlink(shadersPath);
      Swal.fire({
        icon: 'success',
        title: 'Success !',
        text: 'You shaders has been submitted ! You can find them in #ryu-shaders channel. Once approved it will be shared to everyone !'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'rate limit',
        text: 'You shared too many times shaders. Please retry a bit later we just want to avoid spam'
      });
    }
  });

  electron.ipcRenderer.on('uploaded-fail', () => {
    done();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred during the upload process. Anonfiles is maybe down or not available in your country. Please retry a bit later'
    });
  })
}

const toBuffer = (ab: ArrayBuffer) => {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

export const installModToRyujinx = async (config: IRyujinxConfig, titleID: string, modName: string, modFileName: string, content: string | ArrayBuffer) => {
  let modPath = getRyujinxPath(config, 'mods', 'contents', titleID, modName, 'exefs');
  const isZip = modFileName.includes('.zip');

  if (isZip) {
    modPath = getRyujinxPath(config, 'mods', 'contents', titleID, modName);
  }

  const exists = await fs.promises.access(modPath).then(() => true).catch(() => false);

  if (!exists && !isZip) { // We do not want to create subfolders for zip mods, I assume the archive contain a root directory with "exefs" and / or "romfs" directories
    await fs.promises.mkdir(modPath, {recursive: true});
  }

  let filePath = path.resolve(modPath, modFileName);

  if (typeof  content === "string") { // If mod is a utf-8 file, just write to disk
    await fs.promises.writeFile(filePath, content, 'utf-8');
  } else { // If it is not, assume it is a zip and extract it from memory to right location
    const archive = new zip(toBuffer(content));
    archive.extractAllTo(path.resolve(modPath, '..'),true);
  }

  await Swal.fire({
    icon: 'success',
    text: `${modName} successfully installed ${isZip ? '' : `at ${modPath}`}`
  })
}
