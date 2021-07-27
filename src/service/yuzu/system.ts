import * as fs from "fs";
import path from "path";
import { getKeysContent } from "../../api/emusak";
import { IEmusakEmulatorConfig } from "../../types";
import electron from "electron";
import Swal from "sweetalert2";

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

