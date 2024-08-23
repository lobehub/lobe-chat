import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileEnv } from '@/config/file';

import { getFullFileUrl } from './files';

const config = {
  S3_ENABLE_PATH_STYLE: false,
  S3_PUBLIC_DOMAIN: 'https://example.com',
  S3_BUCKET: 'my-bucket',
};

vi.mock('@/config/file', () => ({
  get fileEnv() {
    return config;
  },
}));

describe('getFullFileUrl', () => {
  it('should return empty string for null or undefined input', () => {
    expect(getFullFileUrl(null)).toBe('');
    expect(getFullFileUrl(undefined)).toBe('');
  });

  it('should return correct URL when S3_ENABLE_PATH_STYLE is false', () => {
    const url = 'path/to/file.jpg';
    expect(getFullFileUrl(url)).toBe('https://example.com/path/to/file.jpg');
  });

  it('should return correct URL when S3_ENABLE_PATH_STYLE is true', () => {
    config.S3_ENABLE_PATH_STYLE = true;
    const url = 'path/to/file.jpg';
    expect(getFullFileUrl(url)).toBe('https://example.com/my-bucket/path/to/file.jpg');
    config.S3_ENABLE_PATH_STYLE = false;
  });
});
