import { IEmulatorStorageInterface, IRyujinxConfig } from "../types";
import { isRyujinxPortableMode } from "../service/Ryujinx/system";

class RyujinxModel implements IEmulatorStorageInterface {
  public readonly LS_DIRECTORIES_KEY = "ryu-dir"

  public async getDirectories(): Promise<IRyujinxConfig[]> {
    const d = localStorage.getItem(this.LS_DIRECTORIES_KEY);
    let directories = d ? JSON.parse(d) : [];

    // Check dynamically if directories are portable
    directories = await Promise.all(directories.map(async (d: IRyujinxConfig) => {
      const isPortable = await isRyujinxPortableMode(d.path);
      return { ...d, isPortable };
    }));

    return directories;
  }

  public async addDirectory(conf: IRyujinxConfig): Promise<void> {
    const directories = await this.getDirectories();

    if (!directories.map(d => d.path).includes(conf.path)) {
      directories.push(conf);
      localStorage.setItem(this.LS_DIRECTORIES_KEY, JSON.stringify(directories));
    }
  }

  public async deleteDirectory(conf: IRyujinxConfig): Promise<boolean> {
    let directories = await this.getDirectories();
    directories = directories.filter(d => d.path !== conf.path);
    localStorage.setItem(this.LS_DIRECTORIES_KEY, JSON.stringify(directories));

    return true;
  }
}

// Export class as singleton
const instance = new RyujinxModel();
export default instance;
