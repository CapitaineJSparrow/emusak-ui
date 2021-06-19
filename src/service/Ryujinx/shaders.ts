import fs from "fs";
import zip from "adm-zip";
import { getRyujinxPath } from "./system";
import { IRyujinxConfig } from "../../types";
import { progressEvent } from "../../events";
import rimraf from "rimraf";
import { downloadShaderInfo, downloadShaderZip } from "../../api/emusak";
import path from "path";
import { arrayBufferToBuffer } from "../HTTPService";
import Swal from "sweetalert2";

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
}
