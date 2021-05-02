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

export const getEmusakShadersCount = async (): Promise<IEmusakShadersCount> => fetch(`${process.env.EMUSAK_URL}/api/shaders/ryujinx/count`).then(r => r.json())

export const getEmusakSaves = async (): Promise<IEmusakSaves> => fetch(`${process.env.EMUSAK_URL}/api/saves`).then(r => r.json())

export const getEmusakFirmwareVersion = async (): Promise<string> => fetch(`${process.env.EMUSAK_URL}/api/firmware/version`).then(r => r.text()).then(v => v);

export const getEmusakProdKeys = async (): Promise<string> => fetch(`${process.env.EMUSAK_URL}/api/keys`).then(r => r.text()).then(v => v);

export const downloadFirmwareWithProgress = async (progressCallback: Function): Promise<void> => {
  const filename = 'firmware.zip';
  const firmwarePath = path.resolve((electron.app || electron.remote.app).getPath('documents'), filename);
  await downloadFileWithProgress({
    progressCallback,
    filePath: firmwarePath,
    url: '/api/firmware'
  });
  await Swal.fire('Job done !', 'EmuSAK will now open the downloaded firmware location. Go to Ryujinx ⇾ tools ⇾ install firmware ⇾ "Install Firmware from xci or zip" and select downloaded file')
  electron.shell.showItemInFolder(firmwarePath);
}
