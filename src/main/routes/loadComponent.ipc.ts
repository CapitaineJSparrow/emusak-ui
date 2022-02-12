import HttpService from "../services/HttpService";
import electron from "electron";

export type loadComponentsProps = [string];

const loadComponentIpcHandler = async (...args: loadComponentsProps) => {
  const [url] = args;
  HttpService.url = url;
  return Promise.all([
    HttpService.downloadRyujinxShaders(),
    HttpService.downloadSaves(),
    HttpService.getFirmwareVersion(),
    HttpService.getLatestApplicationVersion(),
    electron.app.getVersion(),
    HttpService.downloadMods()
  ]);
};

export default loadComponentIpcHandler;
