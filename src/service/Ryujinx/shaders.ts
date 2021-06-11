import fs from "fs";
import zip from "adm-zip";
import { getRyujinxPath } from "./system";
import { IRyujinxConfig } from "../../types";

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
