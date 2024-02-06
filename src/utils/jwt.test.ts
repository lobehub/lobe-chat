import { describe, expect, it } from 'vitest';

import { NON_HTTP_PREFIX } from '@/const/auth';

import { createJWT } from './jwt';

describe('createJWT', () => {
  it('should create a JWT token', async () => {
    const payload = { test: 'test' };
    const token = await createJWT(payload);
    expect(token).toBeTruthy();
  });
  it('should return a token with NON_HTTP_PREFIX when crypto.subtle does not exist', async () => {
    const originalCryptoSubtle = crypto.subtle;
    // @ts-ignore
    crypto['subtle'] = undefined;

    const payload = { test: 'test' };
    const token = await createJWT(payload);

    expect(token.startsWith(NON_HTTP_PREFIX)).toBeTruthy();

    // @ts-ignore
    crypto['subtle'] = originalCryptoSubtle;
  });
});
