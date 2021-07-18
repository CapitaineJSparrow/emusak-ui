import { IQueryBase } from "../types";

export default class LinuxQueries implements IQueryBase {
  async hasNvidiaGPU(): Promise<boolean> {
    return true; // @TODO
  }
}
