import { EmusakEmulatorsKind } from "../../types";
import path from "path";
import fs from "fs-extra";
import HttpService from "../services/HttpService";

export const installKeys = async (dataPath: string, emu: EmusakEmulatorsKind) => {
  let destPath = emu === "ryu" ? path.join(dataPath, 'system') : path.join(dataPath, 'keys');
  await fs.ensureDir(destPath);
  const keysContent = await HttpService.downloadKeys();
  let keysPath = path.join(destPath, 'prod.keys');
  await fs.writeFile(keysPath, keysContent, 'utf8');
  return keysPath;
}
