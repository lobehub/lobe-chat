import { describe, expect, it, vi } from 'vitest';

import { createAuthI18n } from './createAuthI18n';

vi.mock('@/business/client/authErrorResourceOverrides', () => ({
  getAuthErrorResourceOverrides: (locale: string) => ({
    'codes.BUSINESS_ERROR': locale === 'zh-CN' ? '业务错误' : 'Business error',
  }),
}));

describe('createAuthI18n', () => {
  it.each([
    ['en-US', 'Business error'],
    ['zh-CN', '业务错误'],
  ])('merges auth error resource overrides for %s', async (locale, expected) => {
    const { init, instance } = createAuthI18n(locale);

    await init({ initAsync: false });
    await instance.loadNamespaces('authError');

    expect(instance.t('codes.BUSINESS_ERROR', { ns: 'authError' })).toBe(expected);
  });
});
