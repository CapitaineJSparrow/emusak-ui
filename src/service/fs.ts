import * as fs from 'fs';
import path from "path";

interface Dirent {
  isDirectory: Function;
  isFile: Function;
  name: string;
}

const readDir = async (dirPath: string): Promise<Dirent[]> => fs.promises.readdir(path.resolve(dirPath), { withFileTypes: true })

export const listDirectories = async (dirPath: string): Promise<string[]> => {
  const results = await readDir(dirPath);
  return results.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
}

export const listFiles = async (dirPath: string): Promise<string[]> => {
  const results = await readDir(dirPath);
  return results.filter(dirent => dirent.isFile()).map(dirent => dirent.name)
}
