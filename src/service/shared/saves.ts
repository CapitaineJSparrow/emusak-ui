import path from "path";
import electron from "electron";
import fs from "fs";
import { arrayBufferToBuffer } from "../utils";
import { downloadSaveAb } from "../../api/emusak";
import Swal from "sweetalert2";

export const downloadSave = async (id: string, saveIndex: number, filename: string) => {
  const buffer = await downloadSaveAb(id, saveIndex);
  const documentsPath = path.resolve((electron.app || electron.remote.app).getPath('documents'), filename);
  await fs.writeFileSync(documentsPath, arrayBufferToBuffer(buffer));
  await Swal.fire({
    icon: 'success',
    title: 'Job done !',
    html: `EmuSAK downloaded the save to your <i>Documents</i> folder and will open Windows Explorer. If file or explorer does not show up, try to add an exception for EmuSAK to your Antivirus`
  })
  electron.shell.showItemInFolder(documentsPath);
}
