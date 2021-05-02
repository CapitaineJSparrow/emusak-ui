import fs from "fs/promises";
import Swal from "sweetalert2";

interface IProgress {
  progressCallback?: Function;
  filePath: string;
  url: string;
}

export const downloadFileWithProgress = async ({
  progressCallback,
  filePath,
  url
}: IProgress) => {
  let response = await fetch(`${process.env.EMUSAK_URL}${url}`);
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  let receivedLength = 0;
  let chunks = [];

  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    progressCallback(parseFloat((receivedLength / contentLength).toFixed(2)) * 100)
  }

  progressCallback(100);
  let chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  await fs.writeFile(filePath, chunksAll).catch(e => {
    Swal.fire({
      icon: 'error',
      title: 'Something went wrong ...',
      text: JSON.stringify(e),
    })
  });
  return true;
}
