import { URL } from 'url';
import fetch, { Response } from "node-fetch";
import pRetry from "p-retry";

export enum HTTP_PATHS {
  RYUJINX_SHADERS_LIST = "/v2/shaders/ryujinx/count",
  SAVES_LIST           = "/v2/saves",
  FIRMWARE             = "/firmware/firmware.zip",
  KEYS                 = "/firmware/prod.keys"
}

export enum GITHUB_PATHS {
  THRESHOLD = 'https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/threshold.txt',
  RELEASE_INFO = 'https://api.github.com/repos/stromcon/emusak-ui/releases/latest',
  FIRMWARE_VERSION = 'https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/version.txt',
}

class HttpService {

  public url: string = process.env.EMUSAK_CDN;

  // Trigger HTTP request using an exponential backoff strategy
  protected _fetch(path: string, type: 'JSON' | 'TXT' = 'JSON', host: string = this.url, defaultValue = {}) {
    const url = new URL(path, host);
    return pRetry(
      async () => {
        const response = await fetch(url.href, defaultValue);

        if (response.status >= 400) {
          throw new pRetry.AbortError(response.statusText);
        }

        if (type === 'JSON') {
          return response.json();
        }

        return response.text();
      },
      { retries: 5 }
    ) as unknown as Promise<Response>
  }

  public async downloadRyujinxShaders() {
    return this._fetch(HTTP_PATHS.RYUJINX_SHADERS_LIST);
  }

  public async downloadSaves() {
    return this._fetch(HTTP_PATHS.SAVES_LIST);
  }

  public async getFirmwareVersion() {
    return this._fetch(GITHUB_PATHS.FIRMWARE_VERSION, 'TXT');
  }

  public async downloadKeys() {
    return this._fetch(HTTP_PATHS.KEYS, 'TXT');
  }
}

export default new HttpService();
