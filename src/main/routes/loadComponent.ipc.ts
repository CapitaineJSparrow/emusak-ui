import HttpService from "../services/HttpService";

const loadComponentIpcHandler = async () => {
  return Promise.all([
    HttpService.downloadRyujinxShaders(),
    HttpService.downloadSaves(),
  ]);
}

export default loadComponentIpcHandler;
