import fetch, { RequestInfo, RequestInit } from "node-fetch";
import httpsProxyAgent from "https-proxy-agent";
import { SYS_SETTINGS } from "../../index";

export default function fetchProxy(url: RequestInfo, init: RequestInit = {}) {
  if (SYS_SETTINGS.proxy) {
    init.agent = httpsProxyAgent(SYS_SETTINGS.proxy);
  }
  return fetch(url, init);
}
