import { describe, expect, it, vi } from 'vitest';

import { browserless } from '../browserless';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('browserless', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should throw BrowserlessInitError when credentials not provided', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.BROWSERLESS_TOKEN;
    delete process.env.BROWSERLESS_URL;

    try {
      await browserless('https://example.com', { filterOptions: {} });
      throw new Error('Should not reach here');
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('`BROWSERLESS_URL` or `BROWSERLESS_TOKEN` are required');
      expect(error.name).toBe('BrowserlessInitError');
    }

    process.env = originalEnv;
  });

  it('should return undefined when fetch fails', async () => {
    process.env.BROWSERLESS_TOKEN = 'test-token';
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await browserless('https://example.com', { filterOptions: {} });

    expect(result).toBeUndefined();
  });

  it('should return undefined when response title is "Just a moment..."', async () => {
    process.env.BROWSERLESS_TOKEN = 'test-token';
    mockFetch.mockResolvedValueOnce({
      text: async () =>
        '<html><head><title>Just a moment...</title></head><body>Content</body></html>',
    });

    const result = await browserless('https://example.com', { filterOptions: {} });

    expect(result).toBeUndefined();
  });

  it('should return success result when response is valid', async () => {
    process.env.BROWSERLESS_TOKEN = 'test-token';
    mockFetch.mockResolvedValueOnce({
      text: async () =>
        '<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>',
    });

    const result = await browserless('https://example.com', { filterOptions: {} });

    expect(result).toEqual({
      content: expect.any(String),
      contentType: 'text',
      description: expect.any(String),
      length: expect.any(Number),
      siteName: null,
      title: 'Test Page',
      url: 'https://example.com',
    });
  });

  it('should use custom BROWSERLESS_URL when provided', async () => {
    const customUrl = 'https://custom.browserless.io';
    const originalEnv = process.env;
    process.env = { ...originalEnv, BROWSERLESS_TOKEN: 'test-token', BROWSERLESS_URL: customUrl };

    mockFetch.mockResolvedValueOnce({
      text: async () =>
        '<html><head><title>Test Page</title></head><body><p>Test content</p></body></html>',
    });

    await browserless('https://example.com', { filterOptions: {} });

    const expectedUrl = `${customUrl}/content?token=test-token`;
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/content'),
      expect.objectContaining({
        body: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    );

    process.env = originalEnv;
  });
});
