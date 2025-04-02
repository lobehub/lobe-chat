// @vitest-environment node
import { cookies } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import { normalizeLocale } from '@/locales/resources';
import * as env from '@/utils/env';

import { getLocale, translation } from './translation';

// Mock external dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
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

const translations = {
  key1: 'Value 1',
  key2: 'Value 2 with {{param}}',
  nested: { key: 'Nested value' },
};

vi.mock('@/locales/default/common', () => ({
  ...translations,
  default: translations,
}));

vi.mock('@/../locales/en-US/common.json', () => ({
  ...translations,
  nonexistent: undefined,
}));

vi.mock('@/../locales/zh-CN/common.json', () => translations);

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

  it('should return DEFAULT_LANG if no cookie is set', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const result = await getLocale();
    expect(result).toBe(DEFAULT_LANG);
  });
});

describe('translation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (env.isDev as any) = false;
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

  it('should use zh-CN translations in dev mode for zh-CN locale', async () => {
    (env.isDev as any) = true;
    const result = await translation('common', 'zh-CN');
    expect(result.locale).toBe('zh-CN');
    expect(result.t('key1')).toBe('Value 1');
  });

  it('should handle import errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await translation('common', 'invalid-locale');
    expect(result.t('any.key')).toBe('any.key');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error while reading translation file',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
