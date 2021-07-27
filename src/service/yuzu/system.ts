import * as fs from "fs";
import path from "path";
import { downloadFirmwareWithProgress, getKeysContent } from "../../api/emusak";
import { IEmusakEmulatorConfig } from "../../types";
import electron from "electron";
import Swal from "sweetalert2";
import zip from "adm-zip";
import { asyncExtract } from "../utils";

const getYuzuPath = (config: IEmusakEmulatorConfig, ...paths: string[]) => path.resolve(electron.remote.app.getPath('appData'), 'yuzu', ...paths)

export const installKeysToYuzu = async () => {
  const keysContent = await getKeysContent();
  const keysPath = getYuzuPath(null, 'keys', 'prod.keys');
  await fs.promises.writeFile(keysPath, keysContent, 'utf-8');

  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    html: `Created or replaced keys at : <code>${keysPath}</code>`,
    width: 600
  });
};

export const installFirmware = async () => {
  const firmwareDestPath = path.resolve((electron.app || electron.remote.app).getPath('temp'), 'firmware.zip');
  const firmwareInstallPath = getYuzuPath(null, 'nand', 'system', 'Contents', 'registered');
  const result = await downloadFirmwareWithProgress(firmwareDestPath);

  if (!result) {
    return;
  }

  await asyncExtract(firmwareDestPath, firmwareInstallPath);
  await fs.promises.unlink(firmwareDestPath);
  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    html: `Extracted firmware content to ${firmwareInstallPath}`,
    width: 600
  });
}
