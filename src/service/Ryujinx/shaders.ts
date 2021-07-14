import fs from "fs";
import zip from "adm-zip";
import { getRyujinxPath } from "./system";
import { IRyujinxConfig } from "../../types";
import { progressEvent } from "../../events";
import rimraf from "rimraf";
import { downloadShaderInfo, downloadShaderZip, postEmusakShaderShare } from "../../api/emusak";
import path from "path";
import Swal from "sweetalert2";
import { arrayBufferToBuffer, asyncZipWrite } from "../utils";
import * as electron from "electron";
import { spawn } from "child_process";
import { titleIdToName } from "../EshopDBService";

const paths: string[] = [];

export const countShadersFromGames = (titleIds: string[], config: IRyujinxConfig) => Promise.all(titleIds.map(async id => {
  let shaderZipPath = getRyujinxPath(config, 'games', id, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  const exists = await fs.promises.access(shaderZipPath).then(() => true).catch(() => false);

  if (exists) { // To get shaders count, we just have to count files in zip archive
    try {
      const archive = new zip(shaderZipPath);
      return archive.getEntries().length;
    } catch (e) {}
  }

  return 0;
}));

const displayShadersErrorOnDownload = () => {
  progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress: 0, open: false, downloadSpeed: 0 }}))
  return Swal.fire({
    icon: 'error',
    text: 'Unable to download shaders, please retry'
  })
}

export const installShadersToGame = async (config: IRyujinxConfig, titleId: string) => {
  progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress: 0, open: true, downloadSpeed: 0 }}))
  const shaderDestPath = getRyujinxPath(config, 'games', titleId, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  const infoDestPath = getRyujinxPath(config, 'games', titleId, 'cache', 'shader', 'guest', 'program', 'cache.info');

  const exists = await fs.promises.access(infoDestPath).then(() => true).catch(() => false);

  if (!exists) {
    await fs.promises.mkdir(path.resolve(infoDestPath, '..'), { recursive: true });
  }

  const buffer = await downloadShaderInfo(titleId).catch(() => null);

  if (!buffer) {
    return displayShadersErrorOnDownload();
  }

  const success = await downloadShaderZip(titleId, shaderDestPath).catch(() => null);

  if (!success) {
    return displayShadersErrorOnDownload();
  }

  // Clear compiled Shaders to avoid cache collision issue
  rimraf(getRyujinxPath(config, 'games', titleId, 'cache', 'shader', 'opengl'), () => {});
  await fs.writeFileSync(infoDestPath, arrayBufferToBuffer(buffer));

  return Swal.fire({
    icon: 'success',
    text: 'Shaders successfully installed. Please note, to avoid "cache collision" issue, you will have to rebuild all shaders from scratch on next launch for that game (emusak cleared precompiled shaders)'
  });
};

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
  localCount: number = 0,
  emusakCount: number = 0,
  onRyujinxOpen: Function,
  onRyujinxClose: Function,
  done: Function
) => {

  const key = `ryu-share-${titleID}-${localCount}`;
  const gameName = titleIdToName(titleID);

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
    const message = `Hey there, I'm sharing my shaders using emusak v${electron.remote.app.getVersion()} for **${gameName}** v${result.ranTitleVersion} (${titleID.toUpperCase()}). I have ${localCount} shaders while emusak has ${emusakCount} shaders. Download them from here : \`${btoa(json.data.file.url.short)}\``;
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
