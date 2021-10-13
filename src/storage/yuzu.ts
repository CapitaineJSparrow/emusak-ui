import { IEmulatorStorageInterface, IYuzuConfig } from "../types";
import { isRyujinxPortableMode } from "../service/Ryujinx/system";
import * as fs from "fs/promises";
import Swal from "sweetalert2";

class YuzuModel implements IEmulatorStorageInterface {
  // Localstorage identifier to store ryu config
  protected readonly LS_DIRECTORIES_KEY = "yuzu-dir"

  public async getDirectories(): Promise<IYuzuConfig[]> {
    const d = localStorage.getItem(this.LS_DIRECTORIES_KEY);
    let directories = d ? JSON.parse(d) : [];

    // Check if directories still exists
    const paths: string[] = directories.map((d: IYuzuConfig) => d.path);
    const results = await Promise.all(paths.map(async path => {
      const exists = await fs.stat(path).catch(() => false);
      if (!exists) {
        localStorage.removeItem(this.LS_DIRECTORIES_KEY);
        await Swal.fire({
          icon: 'error',
          title: 'Configuration cleared',
          text: `Path: ${path} doesn't exist anymore, so EmuSAK cleared your configuration. You must add all your yuzu instances again using "Add yuzu folder" button.`
        });
        return false;
      }

      return true;
    }));

    if (results.includes(false)) {
      return this.getDirectories();
    }

    return directories;
  }

  public async addDirectory(conf: IYuzuConfig): Promise<void> {
    const directories = await this.getDirectories();

    if (!directories.map(d => d.path).includes(conf.path)) {
      directories.push(conf);
      localStorage.setItem(this.LS_DIRECTORIES_KEY, JSON.stringify(directories));
    }
  }

  public async deleteDirectory(conf: IYuzuConfig): Promise<boolean> {
    let directories = await this.getDirectories();
    directories = directories.filter(d => d.path !== conf.path);
    localStorage.setItem(this.LS_DIRECTORIES_KEY, JSON.stringify(directories));

    return true;
  }
}

const singleton = new YuzuModel();
export default singleton;
