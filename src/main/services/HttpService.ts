import { URL } from "url";
import { Response } from "node-fetch";
import fetch from "./fetchProxy";
import pRetry from "p-retry";
import { app, BrowserWindow, ipcMain } from "electron";
import http from "http";
import https from "https";
import dns from "dns/promises";
import fs from "fs-extra";
import { hasDnsFile } from "../../index";

export enum HTTP_PATHS {
  RYUJINX_SHADERS_LIST = "/v2/shaders/ryujinx/count",
  SAVES_LIST           = "/v2/saves",
  SAVES_DOWNLOAD       = "/v2/saves?id={id}&index={index}",
  FIRMWARE             = "/firmware/firmware.zip",
  KEYS                 = "/firmware/prod.keys",
  MODS_LIST            = "/mods/",
  MODS_VERSION         = "/mods/{id}/",
  MODS_LIST_VERSION    = "/mods/{id}/{version}/",
  MOD_DOWNLOAD         = "/mods/{id}/{version}/{name}/",
  SHADER_INFO          = "/ryu/{id}.info",
  SHADER_ZIP           = "/ryu/{id}.zip",
  SHADER_UPLOAD        = "/bo/api/submit"
}

export enum GITHUB_PATHS {
  THRESHOLD        = "https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/threshold.txt",
  RELEASE_INFO     = "https://api.github.com/repos/stromcon/emusak-ui/releases/latest",
  FIRMWARE_VERSION = "https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/version.txt",
}

// CloudFlare DNS https://1.1.1.1/dns/
// Resolve an issue where server cannot be reached in rare cases
dns.setServers([
  "1.1.1.1",
  "[2606:4700:4700::1111]",
]);

const staticLookup = () => async (hostname: string, _: null, cb: Function) => {
  const ips = await dns.resolve(hostname);

  if (ips.length === 0) {
    console.error(`Cannot resolve ${hostname}`);
  }

  cb(null, ips[0], 4);
};

const staticDnsAgent = (scheme: "http" | "https") => {
  const httpModule = scheme === "http" ? http : https;
  return new httpModule.Agent({ lookup: hasDnsFile ? staticLookup() : undefined, rejectUnauthorized: false });
};

class HttpService {

  public url: string = process.env.EMUSAK_CDN;

  // Trigger HTTP request using an exponential backoff strategy
  protected _fetch(path: string, type: "JSON" | "TXT" | "BUFFER" = "JSON", host: string = this.url, defaultValue = {}, retries = 5) {
    const url = new URL(path, host);
    return pRetry(
      async () => {
        const response = await fetch(url.href, {
          ...defaultValue,
          ...{
            agent: staticDnsAgent(url.href.includes("http:") ? "http" : "https")
          }
        });

        if (response.status >= 400) {
          throw new pRetry.AbortError(response.statusText);
        }

        if (type === "JSON") {
          return response.json();
        }

        if (type === "BUFFER") {
          return response.arrayBuffer();
        }

        return response.text();
      },
      { retries }
    ) as unknown as Promise<Response>;
  }

  public async fetchWithProgress(path: string, destPath: string, mainWindow: BrowserWindow, eventName: string) {
    const url = new URL(path, this.url);
    const fileStream = fs.createWriteStream(destPath);
    const controller = new AbortController();

    const response = await fetch(url.href, {
      signal: controller.signal,
      agent: staticDnsAgent(this.url.includes("http:") ? "http" : "https")
    });

    let chunkLength = 0;
    let lastEmittedEventTimestamp = 0;
    const contentLength = +(response.headers.get("content-length"));
    const startTime = Date.now();

    ipcMain.on("cancel-download", async (_, abortKey: string) => {
      if (abortKey !== eventName) return;
      fileStream.close();
      await fs.unlink(destPath).catch(() => null);
      controller.abort();
    });

    return new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on("error", reject);
      response.body.on("data", (chunk) => {
        chunkLength += chunk.length;
        const percentage = chunkLength / contentLength * 100;
        const currentTimestamp = +new Date();
        const timeRange = currentTimestamp - startTime;
        const downloadSpeed = chunkLength / timeRange / 1024;

        // Throttle event to 1 time every 100ms
        if (currentTimestamp - lastEmittedEventTimestamp >= 200) {
          mainWindow.webContents.send("download-progress", eventName, percentage.toFixed(2), +downloadSpeed.toFixed(2));
          lastEmittedEventTimestamp = currentTimestamp;
        }
      });
      fileStream.on("finish", () => resolve(destPath));
    }).catch(() => null);
  }

  public async downloadRyujinxShaders() {
    return this._fetch(HTTP_PATHS.RYUJINX_SHADERS_LIST);
  }

  public async downloadSaves() {
    return this._fetch(HTTP_PATHS.SAVES_LIST);
  }

  public async downloadMods() {
    return this._fetch(HTTP_PATHS.MODS_LIST);
  }

  public async getThreshold() {
    return +(await this._fetch(GITHUB_PATHS.THRESHOLD, "TXT"));
  }

  public async getFirmwareVersion() {
    return this._fetch(GITHUB_PATHS.FIRMWARE_VERSION, "TXT");
  }

  public async getLatestApplicationVersion() {
    const versionResponse = await this._fetch(GITHUB_PATHS.RELEASE_INFO).catch(() => null);
    if (!versionResponse) {
      // If we cannot fetch the latest version return the current version to avoid trigger logic when emusak is not up to date
      return app.getVersion();
    }

    return versionResponse.tag_name.replace("v", "");
  }

  public async downloadKeys() {
    return this._fetch(HTTP_PATHS.KEYS, "TXT");
  }

  public async downloadEshopData() {
    return this._fetch("https://github.com/blawar/titledb/blob/master/US.en.json?raw=true");
  }

  public async getRyujinxCompatibility(term: string) {
    // do not use this._fetch because we do not want exponential backoff strategy since GitHub api is limited to 10 requests per minute for unauthenticated requests
    return fetch(`https://api.github.com/search/issues?q=${term}%20repo:Ryujinx/Ryujinx-Games-List`, {
      agent: staticDnsAgent("https")
    }).then(r => r.json());
  }

  public async getVersionsForMod(id: string) {
    return this._fetch(HTTP_PATHS.MODS_VERSION.replace("{id}", id));
  }

  public async getModsForVersion(id: string, version: string) {
    return this._fetch(HTTP_PATHS.MODS_LIST_VERSION.replace("{id}", id).replace("{version}", version));
  }

  public async getModName(id: string, version: string, name: string, controller?: AbortController): Promise<{ modName: string, url: string }> {
    const path = HTTP_PATHS
      .MOD_DOWNLOAD
      .replace("{id}", id)
      .replace("{version}", encodeURIComponent(version))
      .replace("{name}", encodeURIComponent(name));

    const mod = (await this._fetch(path)) as unknown as { name: string }[];

    if (!mod[0]) {
      return;
    }

    const url = new URL(`${path}${encodeURIComponent(mod[0].name)}`, this.url);

    return {
      modName: mod[0].name,
      url: url.href
    };
  }

  public async downloadShaderInfo(id: string) {
    return this._fetch(HTTP_PATHS.SHADER_INFO.replace("{id}", id), "BUFFER");
  }

  public async downloadSave(id: string, index: number) {
    return this._fetch(HTTP_PATHS.SAVES_DOWNLOAD.replace("{id}", id).replace("{index}", `${index}`), "BUFFER");
  }

  public async postMessage(message: string) {
    return this._fetch(HTTP_PATHS.SHADER_UPLOAD, "TXT", this.url,{
      method: "POST",
      body: JSON.stringify({
        message
      })
    });
  }

  public async searchGameBana(query: string) {
    return this._fetch(
      `/apiv7/Util/Game/NameMatch?_sName=${query}&_nPerpage=10&_nPage=1`,
      "JSON",
      "https://gamebanana.com",
      {},
      1
    );
  }
}

export default new HttpService();
