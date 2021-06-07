import { httpRequest } from "../service/HTTPService";

export const PATHS = {
  FIRMWARE: `${process.env.EMUSAK_CDN}/firmware/firmware.zip`,
  KEYS: `${process.env.EMUSAK_CDN}/firmware/prod.keys`,
}

export const getKeysContent = (): Promise<string> => httpRequest(PATHS.KEYS).then(r => r.text());
