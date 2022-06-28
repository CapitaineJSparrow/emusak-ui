import fetch, { RequestInfo, RequestInit } from "node-fetch";
import httpsProxyAgent from "https-proxy-agent";
import { SYS_SETTINGS } from "../../index";

const fetchProxy = (url: RequestInfo, init: RequestInit = {}) => {
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || SYS_SETTINGS.proxy;
  if (proxy) {
    init.agent = httpsProxyAgent(SYS_SETTINGS.proxy);
  }
  return fetch(url, init);
}

export default fetchProxy;
