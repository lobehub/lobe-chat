// @vitest-environment node
import { memoryAdapter } from 'better-auth/adapters/memory';
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import { exportJWK, generateKeyPair, type JWTPayload, SignJWT } from 'jose';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { desktopOIDC } from './desktop-oidc';

const authEnv = vi.hoisted(() => ({ ENABLE_OIDC: true, JWKS_KEY: '' }));

vi.mock('@/envs/app', () => ({ appEnv: { APP_URL: 'http://localhost:3099' } }));
vi.mock('@/envs/auth', () => ({
  authEnv,
  LOBE_CHAT_OIDC_AUTH_HEADER: 'Oidc-Auth',
}));

const baseURL = 'http://localhost:3099';
let key: Awaited<ReturnType<typeof generateKeyPair>>;
let db: Record<string, any[]>;
let auth: ReturnType<typeof createTestAuth>;
let sendVerificationEmail = vi.fn();
const user = (id = 'desktop-user') => ({
  id,
  name: id,
  email: `${id}@example.com`,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  banned: false,
  banExpires: null,
});
async function jwt(overrides: JWTPayload = {}, signingKey = key.privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    sub: 'desktop-user',
    client_id: 'lobehub-desktop',
    iss: `${baseURL}/oidc`,
    aud: 'urn:lobehub:chat',
    iat: now - 10,
    exp: now + 600,
    ...overrides,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(signingKey);
}
async function request(path: string, token?: string, body?: unknown, cookie?: string) {
  return auth.handler(
    new Request(`${baseURL}/api/auth${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        ...(token ? { 'Oidc-Auth': token } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { cookie, origin: baseURL } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
  );
}
function createTestAuth(bridge = true, immediate = false) {
  return betterAuth({
    baseURL,
    secret: 'desktop-test-secret-at-least-thirty-two-characters',
    database: memoryAdapter(db),
    plugins: [admin(), ...(bridge ? [desktopOIDC()] : [])],
    user: { changeEmail: { enabled: true, updateEmailWithoutVerification: immediate } },
    emailVerification: { sendVerificationEmail },
    emailAndPassword: { enabled: true },
    rateLimit: { enabled: false },
  });
}
function setup(bridge = true, immediate = false) {
  auth = createTestAuth(bridge, immediate);
}
beforeAll(async () => {
  key = await generateKeyPair('RS256', { extractable: true });
  authEnv.JWKS_KEY = JSON.stringify({
    keys: [{ ...(await exportJWK(key.privateKey)), alg: 'RS256' }],
  });
});
beforeEach(() => {
  authEnv.ENABLE_OIDC = true;
  db = {
    user: [user(), user('web-user')],
    session: [],
    account: [
      {
        id: 'account-1',
        userId: 'desktop-user',
        providerId: 'github',
        accountId: 'github-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    verification: [],
  };
  sendVerificationEmail = vi.fn();
  setup();
});

describe('desktop OIDC account operations with the real Better Auth handler', () => {
  it('reproduces the 401 without the bridge', async () => {
    setup(false);
    expect(
      (await request('/change-email', await jwt(), { newEmail: 'new@example.com' })).status,
    ).toBe(401);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });
  it('sends verification without changing email, issuing a cookie or creating a session', async () => {
    const before = structuredClone(db);
    const response = await request('/change-email', await jwt(), {
      newEmail: 'new@example.com',
      callbackURL: '/settings/profile',
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: true });
    expect(sendVerificationEmail).toHaveBeenCalledOnce();
    expect(sendVerificationEmail.mock.calls[0][0].user.email).toBe('new@example.com');
    expect(new URL(sendVerificationEmail.mock.calls[0][0].url).pathname).toBe(
      '/api/auth/verify-email',
    );
    expect(db).toEqual(before);
    expect(response.headers.get('set-cookie')).toBeNull();
  });
  it('lists only the token subject accounts', async () => {
    const response = await request('/list-accounts', await jwt());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({ providerId: 'github', accountId: 'github-user' }),
    ]);
    expect(db.session).toEqual([]);
    expect((await request('/list-accounts')).status).toBe(401);
  });
  it.each([
    ['expired', { exp: 1 }],
    ['missing expiry', { exp: undefined }],
    ['wrong audience', { aud: 'another-service' }],
    ['wrong issuer', { iss: 'https://other.example/oidc' }],
    ['wrong client', { client_id: 'lobehub-cli' }],
    ['delegated purpose', { purpose: 'hetero-operation' }],
    ['missing issue time', { iat: undefined }],
    ['future issue time', { iat: 9999999999 }],
    ['deleted user', { sub: 'deleted-user' }],
  ])('rejects %s credentials', async (_, claims) => {
    expect(
      (await request('/change-email', await jwt(claims), { newEmail: 'new@example.com' })).status,
    ).toBe(401);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(db.session).toEqual([]);
  });
  it('rejects an invalid signature', async () => {
    const other = await generateKeyPair('RS256');
    expect((await request('/list-accounts', await jwt({}, other.privateKey))).status).toBe(401);
  });
  it.each([null, new Date(Date.now() + 60000)])(
    'rejects a banned user with ban expiry %s',
    async (banExpires) => {
      Object.assign(db.user[0], { banned: true, banExpires });
      expect((await request('/list-accounts', await jwt())).status).toBe(401);
    },
  );
  it('allows a user whose temporary ban has expired', async () => {
    Object.assign(db.user[0], { banned: true, banExpires: new Date(1) });
    expect((await request('/list-accounts', await jwt())).status).toBe(200);
  });
  it('does not authorize unrelated account/session APIs', async () => {
    const token = await jwt();
    expect(await (await request('/get-session', token)).json()).toBeNull();
    expect((await request('/delete-user', token, {})).status).toBe(401);
    expect(
      (
        await request('/change-password', token, {
          newPassword: 'strong-password',
          currentPassword: 'old-password',
        })
      ).status,
    ).toBe(401);
    expect((await request('/change-email', token)).status).not.toBe(200);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });
  it('requires credentials and honors disabled OIDC', async () => {
    expect((await request('/list-accounts')).status).toBe(401);
    authEnv.ENABLE_OIDC = false;
    expect((await request('/list-accounts', await jwt())).status).toBe(401);
  });
  it('keeps cookie login working and uses the desktop token subject when both identities are present', async () => {
    const signup = await auth.api.signUpEmail({
      body: {
        email: 'cookie-user@example.com',
        name: 'Cookie user',
        password: 'test-password-123',
      },
      asResponse: true,
    });
    expect(signup.status).toBe(200);
    const cookie = signup.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
    expect(cookie).toBeTruthy();
    const webResponse = await request(
      '/change-email',
      undefined,
      { newEmail: 'web-new@example.com' },
      cookie,
    );
    expect(webResponse.status).toBe(200);
    expect(sendVerificationEmail.mock.calls.at(-1)![0].user.id).not.toBe('desktop-user');
    const before = structuredClone(db);
    const desktopResponse = await request(
      '/change-email',
      await jwt(),
      { newEmail: 'desktop-new@example.com' },
      cookie,
    );
    expect(desktopResponse.status).toBe(200);
    expect(sendVerificationEmail.mock.calls.at(-1)![0].user.id).toBe('desktop-user');
    expect(db).toEqual(before);
    expect(desktopResponse.headers.get('set-cookie')).toBeNull();
  });
  it('refuses configurations allowing immediate email mutation', async () => {
    db.user[0].emailVerified = false;
    setup(true, true);
    expect(
      (await request('/change-email', await jwt(), { newEmail: 'new@example.com' })).status,
    ).toBe(403);
    expect(db.user[0].email).toBe('desktop-user@example.com');
  });
});
