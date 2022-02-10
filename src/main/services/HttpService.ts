import { URL } from "url";
import fetch, { Response } from "node-fetch";
import pRetry from "p-retry";
import { app } from "electron";

export enum HTTP_PATHS {
  RYUJINX_SHADERS_LIST = "/v2/shaders/ryujinx/count",
  SAVES_LIST           = "/saves/",
  SAVES_DETAILS        = "/saves/{id}/",
  FIRMWARE             = "/firmware/firmware.zip",
  KEYS                 = "/firmware/prod.keys"
}

export enum GITHUB_PATHS {
  THRESHOLD = "https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/threshold.txt",
  RELEASE_INFO = "https://api.github.com/repos/stromcon/emusak-ui/releases/latest",
  FIRMWARE_VERSION = "https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/version.txt",
}

class HttpService {

  public url: string = process.env.EMUSAK_CDN;

  // Trigger HTTP request using an exponential backoff strategy
  protected _fetch(path: string, type: "JSON" | "TXT" = "JSON", host: string = this.url, defaultValue = {}, retries = 5) {
    const url = new URL(path, host);
    return pRetry(
      async () => {
        const response = await fetch(url.href, defaultValue);

        if (response.status >= 400) {
          throw new pRetry.AbortError(response.statusText);
        }

        if (type === "JSON") {
          return response.json();
        }

        return response.text();
      },
      { retries }
    ) as unknown as Promise<Response>;
  }

  public async downloadRyujinxShaders() {
    return this._fetch(HTTP_PATHS.RYUJINX_SHADERS_LIST);
  }

  public async downloadSaves() {
    return this._fetch(HTTP_PATHS.SAVES_LIST);
  }

  public async downloadSavesDetails(id: string) {
    return this._fetch(HTTP_PATHS.SAVES_DETAILS.replace("{id}", id));
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

  public async getRyujinxCompatibility(id: string) {
    // do not use this._fetch because we do not want exponential backoff strategy since GitHub api is limited to 10 requests per minute for unauthenticated requests
    return fetch(`https://api.github.com/search/issues?q=${id}%20repo:Ryujinx/Ryujinx-Games-List`).then(r => r.json());
  }
}

export default new HttpService();
