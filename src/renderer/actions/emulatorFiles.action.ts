import { GetState, SetState } from "zustand/vanilla";
import { ipcRenderer } from "electron";
import { ITitleBar } from "./titleBar.actions";
import Swal from "sweetalert2";
import pirate from '../resources/pirate.gif'
import i18next from "i18next";
import useStore from "./state";
import { IAlert } from "./alert.action";
import useTranslation from "../i18n/I18nService"

const { t } = useTranslation();
const firmwareFileName = 'firmware.zip';

const onFirmwareProgressEvent = (_: unknown, percentage: number, downloadSpeed: number) => {
  useStore.getState().upsertFileAction({
    filename: firmwareFileName,
    downloadSpeed,
    progress: percentage
  })
}

const createEmulatorFilesSLice = (_set: SetState<{ }>, get: GetState<Partial<ITitleBar & IAlert>>) => ({
  installFirmwareAction: async (dataPath: string) => {
    ipcRenderer.on('download-progress', onFirmwareProgressEvent);
    const extractPath: { error: boolean, code: string } | string | false = await ipcRenderer.invoke('install-firmware', get().currentEmu, dataPath);
    useStore.getState().removeFileAction(firmwareFileName);

    if (extractPath === false) {
      return;
    }

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
      html: `<p style="padding: 5px">${t('firmwareLocation')} : <code>${extractPath}</code></p>`,
    })
  },
  downloadKeysAction: async (dataPath: string) => {
    const result = await ipcRenderer.invoke('install-keys', dataPath, get().currentEmu);
    Swal.fire({
      imageUrl: pirate,
      html: `${t('keysLocation')} : <code>${result}</code>`
    });
  }
});

export default createEmulatorFilesSLice;
