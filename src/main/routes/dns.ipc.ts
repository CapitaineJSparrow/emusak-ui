import fs from "fs-extra";
import { dialog } from "electron";
import { dnsFile } from "../../index";

export const toggleCustomDnsResolver = async () => {
  if (await fs.pathExists(dnsFile)) {
    await fs.unlink(dnsFile).catch(() => null);
  } else {
    await fs.writeFile(dnsFile, "", "utf-8");
  }

  dialog.showMessageBox({
    title: "Done !",
    message: "Please restart emusak so changes can takes effect",
    type: "info",
    buttons: ["Ok"],
  });
};
