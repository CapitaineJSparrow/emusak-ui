import HttpService from "../services/HttpService";
import { app } from "electron";
import fs from "fs-extra";
import path from "path";

export type downloadSaveProps = [string, number, string];

const downloadSave = async (...args: downloadSaveProps) => {
  const [titleId, index, filename] = args;
  const buffer = await HttpService.downloadSave(titleId, index);
  const desktopPath = app.getPath("desktop");
  await fs.writeFile(path.resolve(desktopPath, filename), Buffer.from(buffer as unknown as ArrayBuffer));
};

export default downloadSave;
