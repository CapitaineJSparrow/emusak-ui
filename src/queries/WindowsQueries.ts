import { IQueryBase } from "../types";
import { spawnChild } from "../service/utils";

export default class WindowsQueries implements IQueryBase {
  async hasNvidiaGPU(): Promise<boolean> {
    const result = await spawnChild('wmic.exe', ['path', 'win32_VideoController',  'get', 'name'])
    return !result.toLowerCase().includes('nvidia');
  }
}
