import eshopDataBuildIn from "../../assets/US.en.json";
import fs from "fs-extra";
import { app } from "electron";
import path from "path";

export type EshopData = {
  [key: string]: {
    id: string;
    name: string;
    iconUrl: string;
    screenshots: string[];
  };
};

export const eshopDataPath = path.join(app.getPath("userData"), "eshop.json");

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
