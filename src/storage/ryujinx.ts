import { IEmulatorStorageInterface, IRyujinxConfig } from "../types";
import { isRyujinxPortableMode } from "../service/Ryujinx/system";
import * as fs from "fs/promises";
import Swal from "sweetalert2";

class RyujinxModel implements IEmulatorStorageInterface {
  // Localstorage identifier to store ryu config
  protected readonly LS_DIRECTORIES_KEY = "ryu-dir"

  public async getDirectories(): Promise<IRyujinxConfig[]> {
    console.log('a');
    const d = localStorage.getItem(this.LS_DIRECTORIES_KEY);
    let directories = d ? JSON.parse(d) : [];

    // Check if directories still exists
    const paths: string[] = directories.map((d: IRyujinxConfig) => d.path);
    const results = await Promise.all(paths.map(async path => {
      const exists = await fs.stat(path).catch(() => false);
      if (!exists) {
        localStorage.removeItem(this.LS_DIRECTORIES_KEY);
        await Swal.fire({
          icon: 'error',
          title: 'Configuration cleared',
          text: `Path: ${path} does not exists anymore, so emusak cleared configuration. You must add again all your ryujinx instances using "Add Ryujinx folder" button again.`
        });
        return false;
      }

      return true;
    }));

    if (results.includes(false)) {
      return this.getDirectories();
    }

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

const singleton = new RyujinxModel();
export default singleton;
