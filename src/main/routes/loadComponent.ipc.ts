import HttpService from "../services/HttpService";
import electron from "electron";
import { EmusakMods, EmusakSaves, EmusakShaders } from "../../types";
import { SYS_SETTINGS } from "../../index";

export type loadComponentsProps = [string];

const loadComponentIpcHandler = async (...args: loadComponentsProps) => {
  const [url] = args;
  HttpService.url = url;
  return Promise.all([
    SYS_SETTINGS,
    <Promise<EmusakShaders>> (<unknown> HttpService.downloadRyujinxShaders()),
    <Promise<EmusakSaves>> (<unknown> HttpService.downloadSaves()),
    <Promise<string>> (<unknown> HttpService.getFirmwareVersion()),
    HttpService.getLatestApplicationVersion(),
    electron.app.getVersion(),
    <Promise<EmusakMods>> (<unknown> HttpService.downloadMods()),
    <Promise<number>> (<unknown> HttpService.getThreshold().catch(() => 1E7))
  ]);
};

export default loadComponentIpcHandler;
