import HttpService from "../services/HttpService";
import { app, shell } from "electron";
import fs from "fs-extra";
import path from "path";

export type downloadSaveProps = [string, number, string];

const downloadSave = async (...args: downloadSaveProps) => {
  const [titleId, index, filename] = args;
  const buffer = await HttpService.downloadSave(titleId, index);
  const desktopPath = app.getPath("desktop");
  const fileDest = path.resolve(desktopPath, filename);
  await fs.writeFile(fileDest, Buffer.from(buffer as unknown as ArrayBuffer));
  shell.showItemInFolder(fileDest);
};

export default downloadSave;
