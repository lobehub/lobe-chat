// Browser-safe fallback for ssrf-safe-fetch
// This file is referenced via the "browser" field in package.json so client bundles
// won't pull in node-only modules like `node:fs` or `node:https`.

export const ssrfSafeFetch = async (
  url: string,
  // Avoid using the global RequestInit type directly to prevent eslint `no-undef` in some configs.
  // Use the inferred fetch parameter type so tooling that understands TypeScript will still get correct types.
  options?: Parameters<typeof fetch>[1] & { timeoutMs?: number },
): Promise<Response> => {
  // If there's no global fetch available, fail early.
  if (typeof globalThis === 'undefined' || typeof globalThis.fetch === 'undefined') {
    throw new Error('No fetch() available in this environment');
  }

  const { timeoutMs, ...fetchOptions } = (options || {}) as any;

  try {
    // Add optional timeout handling using AbortController when provided in options.
    if (typeof timeoutMs === 'number' && typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.max(0, timeoutMs));

      try {
        const res = await fetch(url, { ...(fetchOptions as any), signal: controller.signal });
        return res as Response;
      } finally {
        clearTimeout(timer);
      }
    }

    // In the browser we rely on the platform fetch. We intentionally do not attempt
    // to apply SSRF protections here because those protections rely on node-only
    // agents and are intended for server-side use only.
    const res = await fetch(url, fetchOptions as any);
    return res as Response;
  } catch (error) {
    // Keep logging for client-side debugging - do not leak secrets.
    // eslint-disable-next-line no-console
    console.error('Client ssrfSafeFetch error:', error);
    throw error;
  }
};
