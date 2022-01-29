import eshopDataBuildIn from "../../assets/US.en.json";
import fs from "fs-extra";
import { app } from "electron";
import path from "path";

type EshopData = {
  [key: string]: {
    id: string;
    name: string;
    iconUrl: string;
  };
};

export const eshopDataPath = path.join(app.getPath("userData"), "eshop.json");

const getEshopData = async () => {
  const localData = await fs.access(eshopDataPath).then(() => true).catch(() => false);
  let data: EshopData;

  if (localData) {
    data = JSON.parse(await fs.readFile(eshopDataPath, "utf-8"));
  } else {
    data = eshopDataBuildIn;
  }

  return data;
};

export default getEshopData;
