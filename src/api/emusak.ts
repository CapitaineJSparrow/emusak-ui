import path from "path";
import electron from "electron";
import {downloadFileWithProgress} from "../service/http";
import Swal from "sweetalert2";

export interface IEmusakShadersCount {
  [key: string]: number;
}

export interface IEmusakSaves {
  [key: string]: string;
}

export const enum PATHS {
  COUNT_SHADERS = '/api/shaders/ryujinx/count',
  LIST_SAVES = '/api/saves',
  FIRMWARE_VERSION = '/api/firmware/version',
  PROD_KEYS = '/api/keys',
  FIRMWARE_DOWNLOAD = '/api/firmware',
  INFO_DOWNLOAD = '/api/shaders/ryujinx?type=info',
  ZIP_DOWNLOAD = '/api/shaders/ryujinx?type=zip',
}

export const getEmusakShadersCount = async (): Promise<IEmusakShadersCount> => fetch(`${process.env.EMUSAK_URL}${PATHS.COUNT_SHADERS}`).then(r => r.json())

export const getEmusakSaves = async (): Promise<IEmusakSaves> => fetch(`${process.env.EMUSAK_URL}${PATHS.LIST_SAVES}`).then(r => r.json())

export const getEmusakFirmwareVersion = async (): Promise<string> => fetch(`${process.env.EMUSAK_URL}${PATHS.FIRMWARE_VERSION}`).then(r => r.text()).then(v => v);

export const getEmusakProdKeys = async (): Promise<string> => fetch(`${process.env.EMUSAK_URL}${PATHS.PROD_KEYS}`).then(r => r.text()).then(v => v);

export const downloadFirmwareWithProgress = async (progressCallback: Function): Promise<void> => {
  const filename = 'firmware.zip';
  const firmwarePath = path.resolve((electron.app || electron.remote.app).getPath('documents'), filename);
  await downloadFileWithProgress({
    progressCallback,
    filePath: firmwarePath,
    url: PATHS.FIRMWARE_DOWNLOAD
  });
  await Swal.fire('Job done !', 'EmuSAK will now open the downloaded firmware location. Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file')
  electron.shell.showItemInFolder(firmwarePath);
}
