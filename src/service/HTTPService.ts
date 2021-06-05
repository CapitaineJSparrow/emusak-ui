import pRetry from "p-retry";
import * as fs from "fs";

/**
 * Create an HTTP Request with exponential backoff strategy
 * https://dzone.com/articles/understanding-retry-pattern-with-exponential-back
 * @param url
 * @param options
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
 * @param url
 * @param options
 * @param destPath
 * @param progressCallback
 */
export const httpRequestWithProgress = async (url: string, options: RequestInit = {}, destPath: string, progressCallback?: Function) => {
  const response = await httpRequest(url, options).catch(e => {
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

    if (progressCallback) {
      progressCallback(parseFloat((receivedLength / contentLength).toFixed(2)) * 100, receivedLength, contentLength)
    }
  }

  if (progressCallback) {
    progressCallback(100);
  }

  let completeChunks = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    completeChunks.set(chunk, position);
    position += chunk.length;
  }

  await fs.promises.writeFile(destPath, completeChunks);
  return true;
}
