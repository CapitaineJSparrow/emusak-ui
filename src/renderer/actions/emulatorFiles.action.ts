import { GetState, SetState } from "zustand/vanilla";
import { ipcRenderer } from "electron";
import { ITitleBar } from "./titleBar.actions";
import Swal from "sweetalert2";
import pirate from '../resources/pirate.gif'
import i18next from "i18next";

const createEmulatorFilesSLice = (_set: SetState<{ }>, get: GetState<Partial<ITitleBar>>) => ({
  installFirmwareAction: async (dataPath: string) => {
    const extractPath: { error: boolean, code: string } | string = await ipcRenderer.invoke('install-firmware', get().currentEmu, dataPath);

    if (typeof extractPath === "object") {
      return Swal.fire({
        icon: 'error',
        text: i18next.t(extractPath.code)
      })
    }

    return Swal.fire({
      imageUrl: pirate,
      html: `Firmware have been to <code>${extractPath}</code> directory.`,
    })
  }
});

export default createEmulatorFilesSLice;
