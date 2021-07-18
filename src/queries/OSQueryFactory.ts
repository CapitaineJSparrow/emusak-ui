import { IQueryBase } from "../types";
import LinuxQueries from "./LinuxQueries";
import WindowsQueries from "./WindowsQueries";

class OSQueryFactory implements IQueryBase {

  private queryBuilder: IQueryBase;

  constructor() {
    if (process.platform === "win32") {
      console.log('Using windows query builder')
      this.queryBuilder = new WindowsQueries();
    } else {
      console.log('Using linux query builder');
      this.queryBuilder = new LinuxQueries();
    }
  }

  async hasNvidiaGPU(): Promise<boolean> {
    return this.queryBuilder.hasNvidiaGPU();
  }
}

const singleton = new OSQueryFactory();
export default singleton;
