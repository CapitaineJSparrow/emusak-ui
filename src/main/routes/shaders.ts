import fs from "fs-extra";
import path from "path";
import zip from "adm-zip";
import HttpService, { HTTP_PATHS } from "../services/HttpService";
import { BrowserWindow, dialog, app } from "electron";
import { buildMetadataForTitleId } from "./systemScan.ipc";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import FormData from "form-data";
import https from "https";
import fetch from "node-fetch";

export type countShadersProps = [string, string];

export type installShadersProps = [string, string];

export type shareShaders = [string, string, number, number];

export const asyncZipWrite = (archive: zip, path: string): Promise<void> => new Promise((resolve) => {
  archive.writeZip(path, () => resolve());
});

const updateConfig = (conf: any) => {
  conf["logging_enable_error"] = true;
  conf["logging_enable_guest"] = true;
  conf["logging_enable_info"] = true;
  conf["logging_enable_stub"] = true;
  conf["logging_enable_warn"] = true;
  conf["logging_enable_fs_access_log"] = true;
  return conf;
};

const asyncReadRyujinxProcess = async (ryuBinPath: string): Promise<any> => new Promise((resolve, reject) => {
  let child: ChildProcessWithoutNullStreams;
  try {
    child = spawn(ryuBinPath);
  } catch(e) {
    dialog.showMessageBox({
      title: "Error",
      message: "Cannot launch Ryujinx, please redo the same but launch Emusak as admin. Probably antivirus prevent emusak to launch Ryujinx",
      type: "error",
      buttons: ["Ok"],
    });
    return Promise.reject("");
  }
  let fullData = "";
  let ranTitleId: string;
  let compiledShadersCount: number;
  let ranTitleVersion: string;

  child.on("exit", () => resolve(false));
  child.stdout.on("data", (data: string) => {
    fullData += data;
    const titleIdMatch = /for Title (.+)/gi.exec(fullData);
    const shaderCountMatch = /Shader cache loaded (\d+) entries/gi.exec(fullData);
    const titleVersionMatch = /v([\d+.]+) \[/.exec(fullData);

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
  child.stdout.on("error", () => reject(false));
});

export const packShaders = async (dataPath: string, titleID: string): Promise<any> => {
  const shaderZipPath = path.resolve(dataPath, "games", titleID.toLowerCase(), "cache", "shader", "guest", "program", "cache.zip");
  const shaderInfoPath = path.resolve(dataPath, "games", titleID.toLowerCase(), "cache", "shader", "guest", "program", "cache.info");
  const archive = new zip();
  archive.addLocalFile(shaderZipPath);
  archive.addLocalFile(shaderInfoPath);

  const zipPath = path.resolve(shaderInfoPath, "..", "upload.zip");
  await asyncZipWrite(archive, zipPath);

  return zipPath;
};


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

  const result = await HttpService.fetchWithProgress(HTTP_PATHS.SHADER_ZIP.replace("{id}", titleId), shaderDestPath, mainWindow, titleId);

  if (!result) {
    return null;
  }

  await fs.emptyDir(path.resolve(dataPath, "games", titleId.toLowerCase(), "cache", "shader", "opengl"));

  return true;
};

export const shareShaders = async (mainWindow: BrowserWindow, ...args: shareShaders) => {
  const [titleId, dataPath, localCount, emusakCount] = args;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ["openFile"] });

  if (canceled) {
    return { error: true, code: "OPERATION_CANCELED" };
  }

  const ryuBinary = filePaths[0];

  if (!ryuBinary.toLowerCase().includes("ryujinx")) {
    return { error: true, code: "INVALID_RYUJINX_BINARY" };
  }

  const ldnConfigPath = path.resolve(dataPath, "LDNConfig.json");
  const hasLdnConfigFile = await fs.promises.access(ldnConfigPath).then(() => true).catch(() => false);
  const standardConfigPath = path.resolve(dataPath, "Config.json");

  let ryujinxConfig = JSON.parse((await fs.promises.readFile(standardConfigPath)).toString());
  ryujinxConfig = updateConfig(ryujinxConfig);
  await fs.promises.writeFile(hasLdnConfigFile ? ldnConfigPath : standardConfigPath, JSON.stringify(ryujinxConfig, null, 2), "utf-8");

  const metadata = await buildMetadataForTitleId(titleId);
  const result = await asyncReadRyujinxProcess(ryuBinary).catch(() => false);

  if (!result) {
    return;
  }

  if (result.ranTitleId.toLowerCase() !== titleId.toLowerCase()) {
    return { error: true, code: `You shared the wrong titleID, you had to run ${metadata.title || metadata.titleId} in Ryujinx` };
  }

  if (result.compiledShadersCount !== localCount) {
    return { error: true, code: `You have ${localCount} on your cache but Ryujinx compiled ${result.compiledShadersCount}. That means that some shaders are either corrupted or rejected. This probably isn't your fault, it probably means you build shaders a longer time ago and Ryujinx chose to reject them because they changed something in their code. The game probably run fine, but because we share shaders to everyone, we chose to reject your submission to avoid any conflict as we aren't 100% sure if this will cause issue to anyone.` };
  }

  const shadersPath = await packShaders(dataPath, titleId);
  const size = fs.lstatSync(shadersPath).size;
  let bytes = 0;
  let lastEmittedEventTimestamp = 0;

  const readStream = fs.createReadStream(shadersPath).on("data", (chunk) => {
    bytes += chunk.length;
    const currentTimestamp = +new Date();
    if (currentTimestamp - lastEmittedEventTimestamp >= 100) {
      const percentage = (bytes / size * 100).toFixed(2);
      mainWindow.webContents.send("download-progress", titleId, percentage);
      lastEmittedEventTimestamp = +new Date();
    }
  });

  const form = new FormData();
  form.append("file", readStream);

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const res = await fetch("https://api.anonfiles.com/upload", {
    method: "POST",
    agent: httpsAgent,
    body: form
  }).catch(null).then(r => r.json());

  if (!res) {
    return { error: true, code: "SHARE_UPLOAD_FAIL" };
  }

  const message = `Hey there, I'm sharing my shaders using EmuSAK v${app.getVersion()} for **${metadata.title || metadata.titleId}** v${result.ranTitleVersion} (${titleId.toUpperCase()}). I have ${localCount} shaders while EmuSAK has ${emusakCount} shaders. Download them from here : \`${Buffer.from((res as any).data.file.url.short).toString("base64")}\``;
  await HttpService.postMessage(message);
  return true;
};
