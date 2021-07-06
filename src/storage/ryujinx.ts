import { IEmulatorStorageInterface, IRyujinxConfig } from "../types";
import { isRyujinxPortableMode } from "../service/Ryujinx/system";

class RyujinxModel implements IEmulatorStorageInterface {
  static readonly LS_DIRECTORIES = "ryu-dir"

  async getDirectories(): Promise<IRyujinxConfig[]> {
    const d = localStorage.getItem(RyujinxModel.LS_DIRECTORIES);
    let directories = d ? JSON.parse(d) : [];

    // Check dynamically if directories are portable
    directories = await Promise.all(directories.map(async (d: IRyujinxConfig) => {
      const isPortable = await isRyujinxPortableMode(d.path);
      return { ...d, isPortable };
    }));

    return directories;
  }

  async addDirectory(conf: IRyujinxConfig): Promise<void> {
    const directories = await this.getDirectories();

    if (!directories.map(d => d.path).includes(conf.path)) {
      directories.push(conf);
      localStorage.setItem(RyujinxModel.LS_DIRECTORIES, JSON.stringify(directories));
    }
  }

  async deleteDirectory(conf: IRyujinxConfig): Promise<boolean> {
    let directories = await this.getDirectories();
    directories = directories.filter(d => d.path !== conf.path);
    localStorage.setItem(RyujinxModel.LS_DIRECTORIES, JSON.stringify(directories));

    return true;
  }
}

// Export class as singleton
const instance = new RyujinxModel();
export default instance;
