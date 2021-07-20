import { IBaseEmulator } from "../IBaseEmulator";

class Yuzu implements IBaseEmulator {
  public path: string;

  constructor(path: string) {
    this.path = path;
  }
}

export default Yuzu;
