import glob from "glob";
import zip from "adm-zip";
import { spawn } from "child_process"

export const arrayBufferToBuffer = (ab: ArrayBuffer) => {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

export const asyncGlob = (pattern: string) => new Promise((resolve, reject) => {
  glob(pattern, (err, files) => {
    if (err) reject(err);
    else resolve(files);
  })
});

export const asyncZipWrite = (archive: zip, path: string): Promise<void> => new Promise((resolve) => {
  archive.writeZip(path, () => resolve());
});

export const spawnChild = async (command: string, args: string[]) => {
  const child = spawn(command, args);

  let data = "";
  for await (const chunk of child.stdout) {
    data += chunk;
  }
  let error = "";
  for await (const chunk of child.stderr) {
    error += chunk;
  }
  const exitCode = await new Promise( (resolve) => {
    child.on('close', resolve);
  });

  if( exitCode) {
    throw new Error( `subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}
