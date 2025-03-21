import { describe, expect, it, vi } from 'vitest';

import { NON_HTTP_PREFIX } from '@/const/auth';

import { getJWTPayload } from './jwt';

let enableClerkMock = false;
let enableNextAuthMock = false;

vi.mock('@/const/auth', async (importOriginal) => {
  const data = await importOriginal();

  return {
    ...(data as any),
    get enableClerk() {
      return enableClerkMock;
    },
    get enableNextAuth() {
      return enableNextAuthMock;
    },
  };
});

vi.mock('@/config/app', () => ({
  getAppConfig: vi.fn(),
}));

describe('getJWTPayload', () => {
  it('should parse JWT payload for non-HTTPS token', async () => {
    const token = `${NON_HTTP_PREFIX}.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`;
    const payload = await getJWTPayload(token);
    expect(payload).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
  });

  it('should verify and parse JWT payload for HTTPS token', async () => {
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NDb2RlIjoiIiwidXNlcklkIjoiMDAxMzYyYzMtNDhjNS00NjM1LWJkM2ItODM3YmZmZjU4ZmMwIiwiYXBpS2V5IjoiYWJjIiwiZW5kcG9pbnQiOiJhYmMiLCJpYXQiOjE3MTY4MDIyMjUsImV4cCI6MTAwMDAwMDAwMDE3MTY4MDIwMDB9.FF0FxsE8Cajs-_hv5GD0TNUDwvekAkI9l_LL_IOPdGQ';
    const payload = await getJWTPayload(token);
    expect(payload).toEqual({
      accessCode: '',
      apiKey: 'abc',
      endpoint: 'abc',
      exp: 10000000001716802000,
      iat: 1716802225,
      userId: '001362c3-48c5-4635-bd3b-837bfff58fc0',
    });
  });

  it('should not verify success and parse JWT payload for dated token', async () => {
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NDb2RlIjoiIiwidXNlcklkIjoiYWY3M2JhODktZjFhMy00YjliLWEwM2QtZGViZmZlMzE4NmQxIiwiYXBpS2V5IjoiYWJjIiwiZW5kcG9pbnQiOiJhYmMiLCJpYXQiOjE3MTY3OTk5ODAsImV4cCI6MTcxNjgwMDA4MH0.8AGFsLcwyrQG82kVUYOGFXHIwihm2n16ctyArKW9100';
    try {
      await getJWTPayload(token);
    } catch (e) {
      expect((e as Error).message).toEqual('"exp" claim timestamp check failed');
    }
  });
});
