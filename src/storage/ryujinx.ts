import { IRyujinxConfig } from "../types";

export default class RyujinxModel {
  static readonly LS_DIRECTORIES = "ryu-dir"

  static getDirectories(): IRyujinxConfig[] {
    const d = localStorage.getItem(RyujinxModel.LS_DIRECTORIES);
    return d ? JSON.parse(d) : [];
  }

  static addDirectory(conf: IRyujinxConfig): boolean {
    const directories = RyujinxModel.getDirectories();

    if (!directories.map(d => d.path).includes(conf.path)) {
      directories.push(conf);
      localStorage.setItem(RyujinxModel.LS_DIRECTORIES, JSON.stringify(directories));
    }

    return true;
  }

  static deleteDirectory(conf: IRyujinxConfig): boolean {
    let directories = RyujinxModel.getDirectories();
    directories = directories.filter(d => d.path !== conf.path);
    localStorage.setItem(RyujinxModel.LS_DIRECTORIES, JSON.stringify(directories));

    return true;
  }
}
