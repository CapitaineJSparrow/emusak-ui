import HttpService from "../services/HttpService";
import { buildMetadataForTitleId } from "./emulatorFilesystem";
import { GithubIssue } from "../../types";

export type ryujinxCompatibilityProps = [string];

// Keep in memory compat data to prevent them to be called many times until program is closed since github API limit requests to 10 per minutes
const memoryDb: { [key: string]: any } = {};

const ryujinxCompatibility = async (...args: ryujinxCompatibilityProps) => {
  const [titleId] = args;

  if (memoryDb[titleId]) {
    return memoryDb[titleId];
  }

  let compatData = <GithubIssue> (await HttpService.getRyujinxCompatibility(titleId).catch(() => null));
  compatData.mode = "id";

  // In case there is no compatibility found, try a search by name instead titleId
  if (compatData.items.length === 0) {
    const metadata = await buildMetadataForTitleId(titleId);
    compatData = <GithubIssue> (await HttpService.getRyujinxCompatibility(metadata.title).catch(() => null));
    if (compatData.items.length > 0) {
      compatData.mode = "name";
    }
  }

  memoryDb[titleId] = compatData;
  return compatData;
};

export default ryujinxCompatibility;
