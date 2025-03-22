import { describe, expect, it, vi } from 'vitest';

import { TimeoutError } from '../errorType';
import { DEFAULT_TIMEOUT, withTimeout } from '../withTimeout';

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve when promise resolves before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await withTimeout(promise, 1000);
    expect(result).toBe('success');
  });

  it('should reject with TimeoutError when promise takes too long', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 200);
    });

    const timeoutPromise = withTimeout(slowPromise, 100);
    vi.advanceTimersByTime(100);

    await expect(timeoutPromise).rejects.toThrow(TimeoutError);
    await expect(timeoutPromise).rejects.toThrow('Request timeout after 100ms');
  });

  it('should use DEFAULT_TIMEOUT when no timeout specified', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), DEFAULT_TIMEOUT + 100);
    });

    const timeoutPromise = withTimeout(slowPromise);
    vi.advanceTimersByTime(DEFAULT_TIMEOUT);

    await expect(timeoutPromise).rejects.toThrow(TimeoutError);
    await expect(timeoutPromise).rejects.toThrow(`Request timeout after ${DEFAULT_TIMEOUT}ms`);
  });

  it('should reject with original error if promise rejects before timeout', async () => {
    const error = new Error('Original error');
    const failingPromise = Promise.reject(error);

    await expect(withTimeout(failingPromise, 1000)).rejects.toThrow('Original error');
  });

  it('should abort controller when timeout occurs', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 2000);
    });

    const timeoutPromise = withTimeout(slowPromise, 1000);
    vi.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow(TimeoutError);
  });
});
