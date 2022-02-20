import eshopDataBuildIn from "../../assets/US.en.json";
import fs from "fs-extra";
import path from "path";
import { app } from "electron";
import { hasPortableFile } from "../../index";

export type EshopData = {
  [key: string]: {
    id: string;
    name: string;
    iconUrl: string;
  };
};

export const eshopDataPath = process.platform === "win32"
  ? (hasPortableFile ? path.resolve(app.getPath("exe"), "..", "electron_cache", "eshop.json") : path.join(app.getPath("userData"), "eshop.json"))
  // We can't write on executable directory on linux if it's installed in /bin (package manager) or with AppImage (readOnly)
  : path.join(app.getPath("userData"), "eshop.json");

const getEshopData = async () => {
  const localData = await fs.access(eshopDataPath).then(() => true).catch(() => false);
  let data: EshopData;

  if (localData) {
    data = JSON.parse(await fs.readFile(eshopDataPath, "utf-8"));
  } else {
    data = eshopDataBuildIn as unknown as EshopData;
  }

  return data;
};

export default getEshopData;
