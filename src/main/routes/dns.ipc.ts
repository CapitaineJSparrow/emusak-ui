import fs from "fs-extra";
import { dialog } from "electron";
import { dnsFile, hasDnsFile } from "../../index";

export const toggleCustomDnsResolver = async () => {
  if (hasDnsFile) {
    await fs.unlink(dnsFile);
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
