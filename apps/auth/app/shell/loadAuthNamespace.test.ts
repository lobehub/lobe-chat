import { describe, expect, it, vi } from 'vitest';

import { loadAuthNamespace } from './loadAuthNamespace';

vi.mock('@/business/client/authErrorResourceOverrides', () => ({
  getAuthErrorResourceOverrides: (locale: string) => ({
    'codes.BUSINESS_ERROR': `Business error: ${locale}`,
  }),
}));

describe('loadAuthNamespace', () => {
  it.each(['en-US', 'zh-CN'])('merges auth error resource overrides for %s', async (locale) => {
    await expect(loadAuthNamespace(locale, 'authError')).resolves.toMatchObject({
      'codes.BUSINESS_ERROR': `Business error: ${locale}`,
    });
  });

  it('leaves other namespaces unchanged', async () => {
    await expect(loadAuthNamespace('en-US', 'auth')).resolves.not.toHaveProperty(
      'codes.BUSINESS_ERROR',
    );
  });
});
