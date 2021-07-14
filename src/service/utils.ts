import glob from "glob";

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
