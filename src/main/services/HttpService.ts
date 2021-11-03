import { URL } from 'url';
import fetch, { Response } from "node-fetch";
import pRetry from "p-retry";

enum HTTP_PATHS {
  RYUJINX_SHADERS_LIST = "/v2/shaders/ryujinx/count",
  SAVES_LIST           = "/v2/saves",
}

class HttpService {

  public url: string = process.env.EMUSAK_CDN;

  // Trigger HTTP request using an exponential backoff strategy
  protected _fetchAsJson(path: string, host: string = this.url, defaultValue = {}) {
    const url = new URL(path, host);
    return pRetry(
      async () => {
        const response = await fetch(url.href, defaultValue);

        if (response.status >= 400) {
          throw new pRetry.AbortError(response.statusText);
        }

        return response.json();
      },
      { retries: 5 }
    ) as unknown as Promise<Response>
  }

  public async downloadRyujinxShaders() {
    return this._fetchAsJson(HTTP_PATHS.RYUJINX_SHADERS_LIST);
  }

  public async downloadSaves() {
    return this._fetchAsJson(HTTP_PATHS.SAVES_LIST);
  }
}

export default new HttpService();
