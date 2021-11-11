import { GetState, SetState } from "zustand/vanilla";
import { ipcRenderer } from "electron";
import { ITitleBar } from "./titleBar.actions";
import Swal from "sweetalert2";
import pirate from '../resources/pirate.gif'
import i18next from "i18next";
import useStore from "./state";
import { IAlert } from "./alert.action";

const onFirmwareProgressEvent = (_: unknown, percentage: number, downloadSpeed: number) => {
  useStore.getState().openAlertAction('info', `Downloading firmware ${percentage} % at ${downloadSpeed} MB/s`, false);
}

const createEmulatorFilesSLice = (_set: SetState<{ }>, get: GetState<Partial<ITitleBar & IAlert>>) => ({
  installFirmwareAction: async (dataPath: string) => {
    ipcRenderer.on('download-progress', onFirmwareProgressEvent);
    const extractPath: { error: boolean, code: string } | string = await ipcRenderer.invoke('install-firmware', get().currentEmu, dataPath);

    if (typeof extractPath === "object") {
      ipcRenderer.removeListener('download-progress', onFirmwareProgressEvent);
      get().closeAlertAction();
      return Swal.fire({
        icon: 'error',
        text: i18next.t(extractPath.code)
      })
    }

    get().closeAlertAction();
    ipcRenderer.removeListener('download-progress', onFirmwareProgressEvent);
    return Swal.fire({
      imageUrl: pirate,
      html: `Firmware have been extracted to <code>${extractPath}</code> directory.`,
    })
  }
});

export default createEmulatorFilesSLice;
