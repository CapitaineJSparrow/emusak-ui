import fs from "fs";
import Swal from "sweetalert2";
import pRetry from "p-retry";

interface IProgress {
  progressCallback?: Function;
  filePath: string;
  url: string;
  fromCdn?: boolean;
}

export const fetchWithRetries = async (url: string, options: RequestInit = {}): Promise<true | Response> => {
  return pRetry(async () => {
    const response = await fetch(url, options).catch(() => false);

    if (!response) {
      throw new Error('Failed to fetch');
    }

    if ((response as Response).status >= 400) {
      // Does not retry if server working but does not allow request
      throw new pRetry.AbortError((response as Response).statusText);
    }

    return response;
  }, {
    retries: 5,
    onFailedAttempt: error => {
      console.log(`Attempt ${error.attemptNumber} failed for ${url}. There are ${error.retriesLeft} retries left.`);
    },
  });
}

export const downloadFileWithProgress = async ({
  progressCallback,
  filePath,
  url,
  fromCdn = false
}: IProgress) => {
  let response = await fetch(`${fromCdn ? process.env.EMUSAK_CDN : process.env.EMUSAK_URL}${url}`);
  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  let receivedLength = 0;
  let chunks = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    if (progressCallback) {
      progressCallback(parseFloat((receivedLength / contentLength).toFixed(2)) * 100)
    }
  }

  if (progressCallback) {
    progressCallback(100);
  }

  let chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  await fs.promises.writeFile(filePath, chunksAll).catch(e => {
    Swal.fire({
      icon: 'error',
      title: 'Something went wrong ...',
      text: JSON.stringify(e),
    })
  });
  return true;
}
