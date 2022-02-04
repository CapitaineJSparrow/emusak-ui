import HttpService from "../services/HttpService";
import fs from "fs-extra";
import { eshopDataPath } from "../services/eshopData";

const downloadEshopData = async () => {
  const response = await HttpService.downloadEshopData().catch(() => false);

  if (!response) {
    return null;
  }

  if (!response) {
    console.error("Unable to fetch tinfoil data");
    process.exit(0); // Don't throw a critical error since script is used in CI
  }

  const data = response as any;
  const titleIds: { [key: string]: any } = {};
  const ids = Object.keys(data);

  ids.forEach(i => {
    const { id, name, iconUrl, screenshots } = data[i];

    if (id && name && iconUrl) {
      titleIds[id.toUpperCase()] = { id, name, iconUrl, screenshots };
    }
  });

  return titleIds;
};

const updateEshopData = async () => {
  const eshopData = await downloadEshopData();
  await fs.writeFile(eshopDataPath, JSON.stringify(eshopData), "utf-8");
};

export default updateEshopData;
