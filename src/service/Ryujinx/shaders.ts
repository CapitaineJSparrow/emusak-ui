import fs from "fs";
import zip from "adm-zip";
import { getRyujinxPath } from "./system";
import { IRyujinxConfig } from "../../types";
import { progressEvent } from "../../events";
import rimraf from "rimraf";
import { downloadShaderInfo, downloadShaderZip } from "../../api/emusak";
import path from "path";
import { arrayBufferToBuffer } from "../HTTPService";

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

export const installShadersToGame = async (config: IRyujinxConfig, titleId: string) => {
  progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress: 0, open: true, downloadSpeed: 0 }}))
  const shaderDestPath = getRyujinxPath(config, 'games', titleId, 'cache', 'shader', 'guest', 'program', 'cache.zip');
  const infoDestPath = getRyujinxPath(config, 'games', titleId, 'cache', 'shader', 'guest', 'program', 'cache.info');

  // Clear compiled Shaders to avoid cache collision issue
  rimraf(getRyujinxPath(config, 'games', titleId, 'cache', 'shader', 'opengl'), () => {});

  const exists = await fs.promises.access(infoDestPath).then(() => true).catch(() => false);

  if (!exists) {
    await fs.promises.mkdir(path.resolve(infoDestPath, '..'), { recursive: true });
  }

  const buffer = await downloadShaderInfo(titleId);
  await fs.writeFileSync(infoDestPath, arrayBufferToBuffer(buffer));
  await downloadShaderZip(titleId, shaderDestPath);
}
