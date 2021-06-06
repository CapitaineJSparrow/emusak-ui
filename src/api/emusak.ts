import { httpRequest } from "../service/HTTPService";

export const PATHS = {
  FIRMWARE: `${process.env.EMUSAK_CDN}/firmware/firmware.zip`,
  KEYS: `${process.env.EMUSAK_CDN}/firmware/prod.keys`,
  FIRMWARE_VERSION: `${process.env.EMUSAK_CDN}/bo/api/firmware/version`
}

export const getKeysContent = (): Promise<string> => httpRequest(PATHS.KEYS).then(r => r.text());

export const getFirmwareVersion = (): Promise<string> => httpRequest(PATHS.FIRMWARE_VERSION).then(r => r.text());
