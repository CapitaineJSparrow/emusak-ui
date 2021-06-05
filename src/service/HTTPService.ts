import fetch, { RequestInit } from "node-fetch";
import pRetry from "p-retry";

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
