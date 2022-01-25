import HttpService from "../services/HttpService";

const loadComponentIpcHandler = async (url: string) => {
  HttpService.url = url;
  return Promise.all([
    HttpService.downloadRyujinxShaders(),
    HttpService.downloadSaves(),
    HttpService.getFirmwareVersion(),
  ]);
};

export default loadComponentIpcHandler;
