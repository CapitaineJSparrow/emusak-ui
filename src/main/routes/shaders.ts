import fs from "fs-extra";
import path from "path";
import zip from "adm-zip";

export type countShadersProps = [string, string];

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
