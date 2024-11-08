import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileEnv } from '@/config/file';

import { getFullFileUrl } from './files';

const config = {
  S3_ENABLE_PATH_STYLE: false,
  S3_PUBLIC_DOMAIN: 'https://example.com',
  S3_BUCKET: 'my-bucket',
  S3_SET_ACL: true,
};

vi.mock('@/config/file', () => ({
  get fileEnv() {
    return config;
  },
}));

describe('getFullFileUrl', () => {
  it('should return empty string for null or undefined input', async () => {
    expect(await getFullFileUrl(null)).toBe('');
    expect(await getFullFileUrl(undefined)).toBe('');
  });

  it('should return correct URL when S3_ENABLE_PATH_STYLE is false', async () => {
    const url = 'path/to/file.jpg';
    expect(await getFullFileUrl(url)).toBe('https://example.com/path/to/file.jpg');
  });

  it('should return correct URL when S3_ENABLE_PATH_STYLE is true', async () => {
    config.S3_ENABLE_PATH_STYLE = true;
    const url = 'path/to/file.jpg';
    expect(await getFullFileUrl(url)).toBe('https://example.com/my-bucket/path/to/file.jpg');
    config.S3_ENABLE_PATH_STYLE = false;
  });
});
