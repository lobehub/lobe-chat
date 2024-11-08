// @vitest-environment node
import { cookies } from 'next/headers';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import { normalizeLocale } from '@/locales/resources';
import * as env from '@/utils/env';

import { getLocale, translation } from './translation';

// Mock external dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('node:path', () => ({
  join: vi.fn(),
}));

vi.mock('@/const/locale', () => ({
  DEFAULT_LANG: 'en-US',
  LOBE_LOCALE_COOKIE: 'LOBE_LOCALE',
}));

vi.mock('@/locales/resources', () => ({
  normalizeLocale: vi.fn((locale) => locale),
}));

vi.mock('@/utils/env', () => ({
  isDev: false,
}));

describe('getLocale', () => {
  const mockCookieStore = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as any).mockReturnValue(mockCookieStore);
  });

  it('should return the provided locale if hl is specified', async () => {
    const result = await getLocale('fr-FR');
    expect(result).toBe('fr-FR');
    expect(normalizeLocale).toHaveBeenCalledWith('fr-FR');
  });

  it('should return the locale from cookie if available', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'de-DE' });
    const result = await getLocale();
    expect(result).toBe('de-DE');
    expect(mockCookieStore.get).toHaveBeenCalledWith(LOBE_LOCALE_COOKIE);
  });

  it('should return DEFAULT_LANG if no cookie is set', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const result = await getLocale();
    expect(result).toBe(DEFAULT_LANG);
  });
});

describe('translation', () => {
  const mockTranslations = {
    key1: 'Value 1',
    key2: 'Value 2 with {{param}}',
    nested: { key: 'Nested value' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockTranslations));
    (path.join as any).mockImplementation((...args: any) => args.join('/'));
  });

  it('should return correct translation object', async () => {
    const result = await translation('common', 'en-US');
    expect(result).toHaveProperty('locale', 'en-US');
    expect(result).toHaveProperty('t');
    expect(typeof result.t).toBe('function');
  });

  it('should translate keys correctly', async () => {
    const { t } = await translation('common', 'en-US');
    expect(t('key1')).toBe('Value 1');
    expect(t('key2', { param: 'test' })).toBe('Value 2 with test');
    expect(t('nested.key')).toBe('Nested value');
  });

  it('should return key if translation is not found', async () => {
    const { t } = await translation('common', 'en-US');
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should use fallback language if specified locale file does not exist', async () => {
    (fs.existsSync as any).mockReturnValueOnce(false);
    await translation('common', 'nonexistent-LANG');
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining(`/${DEFAULT_LANG}/common.json`),
      'utf8',
    );
  });

  it('should use zh-CN in dev mode when fallback is needed', async () => {
    (fs.existsSync as any).mockReturnValueOnce(false);
    (env.isDev as unknown as boolean) = true;
    await translation('common', 'nonexistent-LANG');
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('/zh-CN/common.json'),
      'utf8',
    );
  });

  it('should handle file reading errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (fs.readFileSync as any).mockImplementation(() => {
      throw new Error('File read error');
    });

    const result = await translation('common', 'en-US');
    expect(result.t('any.key')).toBe('any.key');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error while reading translation file',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
