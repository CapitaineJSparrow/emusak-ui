import HttpService from "../services/HttpService";

export type ryujinxCompatibilityProps = [string];

// Keep in memory compat data to prevent them to be called many times until program is closed since github API limit requests to 10 per minutes
const memoryDb: { [key: string]: any } = {};

const ryujinxCompatibility = async (...args: ryujinxCompatibilityProps) => {
  const [titleId] = args;

  if (memoryDb[titleId]) {
    return memoryDb[titleId];
  }

  const compatData = await HttpService.getRyujinxCompatibility(titleId).catch(() => null);

  if (!compatData) {
    return;
  }

  memoryDb[titleId] = compatData;
  return compatData;
};

export default ryujinxCompatibility;
