import HttpService from "../services/HttpService";
import electron from "electron";

const loadComponentIpcHandler = async (url: string) => {
  HttpService.url = url;
  return Promise.all([
    HttpService.downloadRyujinxShaders(),
    HttpService.downloadSaves(),
    HttpService.getFirmwareVersion(),
    HttpService.getLatestApplicationVersion(),
    electron.app.getVersion(),
  ]);
};

export default loadComponentIpcHandler;
