import { IRyujinxConfig } from "../types";
import { isRyujinxPortableMode } from "../service/Ryujinx/system";

export default class RyujinxModel {
  static readonly LS_DIRECTORIES = "ryu-dir"

  static async getDirectories(): Promise<IRyujinxConfig[]> {
    const d = localStorage.getItem(RyujinxModel.LS_DIRECTORIES);
    let directories = d ? JSON.parse(d) : [];
    directories = await Promise.all(directories.map(async (d: IRyujinxConfig) => {
      const isPortable = await isRyujinxPortableMode(d.path);
      return { ...d, isPortable };
    }));
    return directories;
  }

  static async addDirectory(conf: IRyujinxConfig): Promise<boolean> {
    const directories = await RyujinxModel.getDirectories();

    if (!directories.map(d => d.path).includes(conf.path)) {
      directories.push(conf);
      localStorage.setItem(RyujinxModel.LS_DIRECTORIES, JSON.stringify(directories));
    }

    return true;
  }

  static async deleteDirectory(conf: IRyujinxConfig): Promise<boolean> {
    let directories = await RyujinxModel.getDirectories();
    directories = directories.filter(d => d.path !== conf.path);
    localStorage.setItem(RyujinxModel.LS_DIRECTORIES, JSON.stringify(directories));

    return true;
  }
}
