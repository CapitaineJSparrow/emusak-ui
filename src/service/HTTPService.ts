import pRetry from "p-retry";
import * as fs from "fs";
import Swal from "sweetalert2";
import { progressEvent } from "../events";

/**
 * Create an HTTP Request with exponential backoff strategy
 * https://dzone.com/articles/understanding-retry-pattern-with-exponential-back
 */
export const httpRequest = (url: string, options: RequestInit = {}): Promise<Response> => pRetry(
  async () => {
    const response = await fetch(url, options);

    if (response.status >= 400) {
      throw new pRetry.AbortError(response.statusText);
    }

    return response;
  },
  { retries: 5 }
) as unknown as Promise<Response>

/**
 * Get a HTTP reader to track download progress
 * https://javascript.info/fetch-progress
 */
export const httpRequestWithProgress = async (url: string, destPath: string) => {
  const response = await httpRequest(url).catch(e => {
    console.error(e);
    return null;
  });

  if (!response) {
    return Promise.reject(`Unable to reach server ${url}`)
  }

  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  let receivedLength = 0;
  let chunks = [];

  while(true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;
    progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress: parseFloat(((receivedLength / contentLength) * 100).toFixed(2)), open: true } }));
  }

  let completeChunks = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    completeChunks.set(chunk, position);
    position += chunk.length;
  }

  if (receivedLength !== contentLength) {
    await Swal.fire({
      icon: 'error',
      text: 'For an unknown reason, downloaded content has been corrupted during transfer. Please retry.'
    });
    return Promise.reject(`Received bytes length does not match content length`);
  }

  await fs.promises.writeFile(destPath, completeChunks);
  progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress: 0, open: false }}));
  return true;
}
