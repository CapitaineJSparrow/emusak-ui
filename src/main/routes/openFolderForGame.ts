import { shell } from "electron";
import path from "path";
import fs from "fs-extra";
import { EmusakEmulatorsKind } from "../../types";

export type openFolderIPCProps = [string, "shaders" | "mods", string, EmusakEmulatorsKind];

const openYuzuFolders = async (...args: openFolderIPCProps) => {
  const [titleId, dir, dataPath] = args;

  if (dir === "mods") {
    const modPath = path.resolve(dataPath, "load", titleId.toUpperCase());
    await fs.ensureDir(modPath);
    return shell.openPath(modPath);
  }

  const shaderPath = path.resolve(dataPath, "shader", titleId.toLocaleLowerCase());
  await fs.ensureDir(shaderPath);
  return shell.openPath(shaderPath);
};

const openFolderForGame = async (...args: openFolderIPCProps) => {
  const [titleId, dir, dataPath, currentEmu] = args;

  if (currentEmu === "yuzu") {
    return openYuzuFolders(...args);
  }

  // Ryujinx folders paths
  if (dir === "mods") {
    const modPath = path.resolve(dataPath, "mods", "contents", titleId.toLocaleLowerCase());
    await fs.ensureDir(modPath); // Mod directory may not exist if it has never been opened so create it
    return shell.openPath(modPath);
  }

  const shaderPath = path.resolve(dataPath, "games", titleId.toLocaleLowerCase(), "cache", "shader");
  await fs.ensureDir(shaderPath); // shader directory may not exist if it has never been opened so create it
  return shell.openPath(shaderPath);
};

export default openFolderForGame;
