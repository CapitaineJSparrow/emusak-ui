import * as electron from "electron";
import * as fs from "fs";
import path from "path";

interface IDirent {
  isDirectory: Function;
  isFile: Function;
  name: string;
}

export const pickOneFolder: () => Promise<string|null> = async () => {
  const { filePaths } = await electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
  return filePaths.length > 0 ? filePaths[0] : null;
}

export const readDir = async (dirPath: string): Promise<IDirent[]> => fs.promises.readdir(path.resolve(dirPath), { withFileTypes: true })
