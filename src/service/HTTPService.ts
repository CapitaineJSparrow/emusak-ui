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

const sendDownloadFinishedEvent = () => progressEvent.dispatchEvent(new CustomEvent('progress', { detail: { progress: 0, open: false, downloadSpeed: 0 }}));

/**
 * Get a HTTP reader to track download progress
 * https://javascript.info/fetch-progress
 */
export const httpRequestWithProgress = async (url: string, destPath: string) => {
  const controller = new AbortController();
  const signal = controller.signal;

  const response = await httpRequest(url, { signal }).catch(e => {
    console.error(e);
    return null;
  });

  if (!response) {
    return Promise.reject(`Unable to reach server ${url}`)
  }

  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  let receivedLength = 0;
  let startTime = Date.now();
  let downloadSpeed = 0;
  let chunks = [];
  let isCanceled = false;
  let lastEmittedEventTimestamp = 0;

  while(!isCanceled) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;
    const mbps = receivedLength / (1024 * 1024);
    downloadSpeed = Date.now() - startTime === 0 ? downloadSpeed : mbps / ((Date.now() - startTime) / 1000);
    const currentTimestamp = +new Date();

    progressEvent.addEventListener('progress-cancel', () => {
      if (isCanceled) return;
      isCanceled = true;
      sendDownloadFinishedEvent();
      controller.abort();
    });

    // Throttle the dispatch event since loop is called many times
    if (currentTimestamp - lastEmittedEventTimestamp >= 100 || receivedLength === contentLength) {
      progressEvent.dispatchEvent(new CustomEvent('progress', {
        detail: {
          progress: parseFloat(((receivedLength / contentLength) * 100).toFixed(1)),
          open: true,
          downloadSpeed: downloadSpeed.toFixed(2)
        }
      }));
      lastEmittedEventTimestamp = +new Date();
    }
  }

  if (receivedLength !== contentLength) {
    await Swal.fire({
      icon: 'error',
      text: 'For an unknown reason, downloaded content has been corrupted during transfer. Please retry.'
    });
    sendDownloadFinishedEvent();
    return Promise.reject(`Received bytes length does not match content length`);
  }

  let completeChunks = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    completeChunks.set(chunk, position);
    position += chunk.length;
  }

  await fs.promises.writeFile(destPath, completeChunks).catch(() => null);
  sendDownloadFinishedEvent();
  return true;
}
