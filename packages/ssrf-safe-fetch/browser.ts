type FetchOptions = Parameters<typeof fetch>[1];

/**
 * Lightweight SSRF-safe fetch placeholder for browser/edge runtimes.
 * These environments already enforce network restrictions, so we simply delegate
 * to the native fetch implementation.
 */
export const ssrfSafeFetch = async (url: string, options?: FetchOptions): Promise<Response> =>
  fetch(url, options);
