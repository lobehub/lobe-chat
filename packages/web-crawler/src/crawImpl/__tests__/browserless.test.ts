import { describe, expect, it, vi } from 'vitest';

import { browserless } from '../browserless';

describe('browserless', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  const mockEnv = {
    BROWSERLESS_TOKEN: 'test-token',
    BROWSERLESS_URL: 'http://test-url',
  } as any;

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    process.env = { ...mockEnv };
  });

  it('should throw BrowserlessInitError when missing required env vars', async () => {
    process.env = {} as any;
    await expect(browserless('http://test.com', { filterOptions: {} })).rejects.toThrow(
      '`BROWSERLESS_URL` or `BROWSERLESS_TOKEN` are required',
    );
  });

  it('should return undefined when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

    const result = await browserless('http://test.com', { filterOptions: {} });

    expect(result).toBeUndefined();
  });

  it('should return undefined when content is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      text: () => Promise.resolve('<html></html>'),
    });

    const result = await browserless('http://test.com', { filterOptions: {} });

    expect(result).toBeUndefined();
  });

  it('should return undefined when title is "Just a moment..."', async () => {
    mockFetch.mockResolvedValueOnce({
      text: () =>
        Promise.resolve(
          '<html><head><title>Just a moment...</title></head><body>content</body></html>',
        ),
    });

    const result = await browserless('http://test.com', { filterOptions: {} });

    expect(result).toBeUndefined();
  });

  it('should return crawl result when successful', async () => {
    mockFetch.mockResolvedValueOnce({
      text: () =>
        Promise.resolve(
          '<html><head><title>Test Title</title><meta name="description" content="Test content"></head><body><p>Test content</p></body></html>',
        ),
    });

    const result = await browserless('http://test.com', { filterOptions: {} });

    expect(result).toEqual({
      content: expect.any(String),
      contentType: 'text',
      description: 'Test content',
      length: expect.any(Number),
      siteName: undefined,
      title: 'Test Title',
      url: 'http://test.com',
    });
  });

  it('should make request with correct parameters', async () => {
    process.env = {
      BROWSERLESS_TOKEN: 'test-token',
    } as any;

    mockFetch.mockResolvedValueOnce({
      text: () =>
        Promise.resolve(
          '<html><head><title>Test Title</title></head><body><p>Test content</p></body></html>',
        ),
    });

    await browserless('http://test.com', { filterOptions: {} });

    expect(mockFetch).toHaveBeenCalledWith('https://chrome.browserless.io/content', {
      body: JSON.stringify({
        gotoOptions: { waitUntil: 'networkidle2' },
        url: 'http://test.com',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });

  it('should use default browserless URL when BROWSERLESS_URL is not set', async () => {
    const { BROWSERLESS_URL, ...envWithoutUrl } = mockEnv;
    process.env = { ...envWithoutUrl };

    mockFetch.mockResolvedValueOnce({
      text: () =>
        Promise.resolve(
          '<html><head><title>Test Title</title></head><body><p>Test content</p></body></html>',
        ),
    });

    await browserless('http://test.com', { filterOptions: {} });

    expect(mockFetch).toHaveBeenCalledWith('https://chrome.browserless.io/content', {
      body: JSON.stringify({
        gotoOptions: { waitUntil: 'networkidle2' },
        url: 'http://test.com',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });
});
