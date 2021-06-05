import { httpRequest } from "../service/HTTPService";
import * as electron from "electron";

export const getThresholdValue = async (): Promise<number> => {
  const thresholdResponse = await httpRequest('https://raw.githubusercontent.com/stromcon/emusak-ui/main/src/assets/threshold.txt').catch(() => null);

  if (!thresholdResponse) {
    // If request failed, just return a very high threshold and UI will display "share shaders feature is temporary disabled"
    return 1E6;
  }

  const threshold = await thresholdResponse.text();
  return +threshold;
};

export const getLatestVersionNumber = async (): Promise<string> => {
  const versionResponse = await httpRequest('https://api.github.com/repos/stromcon/emusak-ui/releases/latest').catch(() => null);

  if (!versionResponse) {
    // If we cannot fetch the latest version return the current version to avoid trigger logic when emusak is not up to date
    return electron.remote.app.getVersion();
  }

  const release = await versionResponse.json();
  return release.tag_name.replace('v', '');
}
