import electron from "electron"

export const pickOneFolder: () => Promise<string|null> = async () => {
  const { filePaths } = await electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
  return filePaths.length > 0 ? filePaths[0] : null;
}
