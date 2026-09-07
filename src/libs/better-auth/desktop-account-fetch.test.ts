import { createAuthClient } from 'better-auth/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { desktopAccountFetch } from './desktop-account-fetch';

afterEach(() => vi.unstubAllGlobals());
describe('desktop account transport', () => {
  it('routes real auth client email and account calls through the desktop proxy', async () => {
    const requests: Request[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input, init) => {
        requests.push(new Request(input, init));
        return Response.json({ status: true });
      }),
    );
    const client = createAuthClient({
      baseURL: 'https://cloud.example',
      fetchOptions: { customFetchImpl: desktopAccountFetch },
    });
    await client.changeEmail({ newEmail: 'new@example.com', callbackURL: '/settings/profile' });
    await client.listAccounts();
    expect(requests.map((r) => r.url)).toEqual([
      'app://renderer/api/auth/change-email',
      'app://renderer/api/auth/list-accounts',
    ]);
    expect(await requests[0].json()).toEqual({
      newEmail: 'new@example.com',
      callbackURL: '/settings/profile',
    });
    expect(requests[0].method).toBe('POST');
  });
  it('preserves other authentication endpoints on the remote server', async () => {
    const fetch = vi.fn(async () => Response.json({}));
    vi.stubGlobal('fetch', fetch);
    await desktopAccountFetch('https://cloud.example/api/auth/sign-in/social', { method: 'POST' });
    expect(fetch).toHaveBeenCalledWith('https://cloud.example/api/auth/sign-in/social', {
      method: 'POST',
    });
  });
});
