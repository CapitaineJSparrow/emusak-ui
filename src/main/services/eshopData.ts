import eshopDataBuildIn from "../../assets/US.en.json";
import fs from "fs-extra";
import path from "path";
import { app } from "electron";

export type EshopData = {
  [key: string]: {
    id: string;
    name: string;
    iconUrl: string;
  };
};

export const eshopDataPath = path.resolve(app.getPath("exe"), "..", "electron_cache", "eshop.json");

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
