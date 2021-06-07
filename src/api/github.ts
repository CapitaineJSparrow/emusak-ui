import { httpRequest } from "../service/HTTPService";
import * as electron from "electron";

enum PATHS {
  THRESHOLD = 'https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/threshold.txt',
  RELEASE_INFO = 'https://api.github.com/repos/stromcon/emusak-ui/releases/latest',
  FIRMWARE_VERSION = 'https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/version.txt',
}

export const getThresholdValue = async (): Promise<number> => {
  const thresholdResponse = await httpRequest(PATHS.THRESHOLD).catch(e => {
    console.error(e);
    return null;
  });

  if (!thresholdResponse) {
    // If request failed, just return a very high threshold and UI will display "share shaders feature is temporary disabled"
    return 1E6;
  }

  const threshold = await thresholdResponse.text();
  return +threshold;
};

export const getLatestVersionNumber = async (): Promise<string> => {
  const versionResponse = await httpRequest(PATHS.RELEASE_INFO).catch(e => {
    console.error(e);
    return null;
  });

  if (!versionResponse) {
    // If we cannot fetch the latest version return the current version to avoid trigger logic when emusak is not up to date
    return electron.remote.app.getVersion();
  }

  const release = await versionResponse.json();
  return release.tag_name.replace('v', '');
}

export const getFirmwareVersion = async (): Promise<string> => {
  const thresholdResponse = await httpRequest(PATHS.FIRMWARE_VERSION).catch(e => {
    console.error(e);
    return null;
  });

  // If we cannot fetch firmware version, just display empty version this should not impact download
  if (!thresholdResponse) {
    return '';
  }

  return thresholdResponse.text();
}
