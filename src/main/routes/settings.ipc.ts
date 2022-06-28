import fs from "fs-extra";
import { proxyFile, SYS_SETTINGS } from "../../index";

export const setProxy = async (proxy = "") => {
  if (SYS_SETTINGS.proxy === proxy) return;
  SYS_SETTINGS.proxy = proxy;
  try {
    await fs.writeFile(proxyFile, proxy);
    return true;
  } catch (e) {
    return false;
  }
};
