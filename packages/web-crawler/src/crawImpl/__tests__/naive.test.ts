import { describe, expect, it } from 'vitest';

describe('naive crawler', () => {
  // Helper function to test withTimeout behavior
  const testWithTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
    const controller = new AbortController();
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new Error(`Request timeout after ${ms}ms`));
      }, ms);
    });

    return Promise.race([promise, timeoutPromise]);
  };

  it('should resolve before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await testWithTimeout(promise, 1000);
    expect(result).toBe('success');
  });
});
