// filepath: /home/ciuc/repo/lobe-chat/packages/ssrf-safe-fetch/index.browser.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ssrfSafeFetch } from './index.browser';

describe('ssrfSafeFetch (browser fallback)', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('throws when no global fetch is available', async () => {
    delete (globalThis as any).fetch;

    await expect(ssrfSafeFetch('https://example.com')).rejects.toThrow('No fetch() available');
  });

  it('aborts request when timeoutMs is reached', async () => {
    // Create a fetch mock that rejects when the provided AbortSignal fires.
    (globalThis as any).fetch = vi.fn((url: string, opts: any) => {
      return new Promise((_resolve, reject) => {
        const signal = opts && opts.signal;
        if (signal) {
          const onAbort = () => reject(new Error('aborted'));
          if (typeof signal.addEventListener === 'function') {
            signal.addEventListener('abort', onAbort);
          } else {
            signal.onabort = onAbort;
          }
        }
        // never resolve to simulate a slow request
      });
    });

    // Use fake timers so the test runs fast
    vi.useFakeTimers();

    const promise = ssrfSafeFetch('https://slow.example', { timeoutMs: 10 });

    // advance timers so the timeout triggers
    vi.advanceTimersByTime(20);

    await expect(promise).rejects.toThrow(/aborted/);

    vi.useRealTimers();
  });
});
