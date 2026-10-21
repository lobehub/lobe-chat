import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assertRunIdentity, checkRunIdentity } from './runIdentity';
import type { AuthSource } from './source';

vi.mock('./credentials', () => ({ loadCredentials: () => null }));

const jwtWithSub = (sub: string) =>
  `header.${Buffer.from(JSON.stringify({ sub })).toString('base64url')}.signature`;

const stored = (token?: string): AuthSource => ({
  kind: 'stored',
  origin: 'stored login (~/.lobehub/credentials.json)',
  token,
  tokenType: 'jwt',
});

/**
 * Regression: an agent on a shared `lh connect` device cleared the run's
 * operation token, as the guide told it to, and `lh acceptance` wrote the record
 * as the device owner instead of the user who started the run.
 */
describe('checkRunIdentity', () => {
  beforeEach(() => {
    vi.stubEnv('LOBEHUB_RUN_USER_ID', 'user_initiator');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('refuses a stored login that belongs to another account', () => {
    const reason = checkRunIdentity(stored(jwtWithSub('user_device_owner')));

    expect(reason).toContain('started by user user_initiator');
    expect(reason).toContain('belongs to user user_device_owner');
    expect(() => assertRunIdentity(stored(jwtWithSub('user_device_owner')))).toThrow(
      'started by user user_initiator',
    );
  });

  it('allows a stored login of the user who started the run', () => {
    expect(checkRunIdentity(stored(jwtWithSub('user_initiator')))).toBeUndefined();
  });

  it('refuses credentials whose account cannot be read', () => {
    expect(
      checkRunIdentity({
        kind: 'env-api-key',
        origin: 'LOBEHUB_CLI_API_KEY',
        token: 'sk-lh-key',
        tokenType: 'apiKey',
      }),
    ).toContain('an account this CLI cannot identify');
    expect(checkRunIdentity(stored('not-a-jwt'))).toContain('an account this CLI cannot identify');
  });

  it('always allows the run token itself', () => {
    expect(
      checkRunIdentity({
        kind: 'env-jwt',
        origin: 'LOBEHUB_JWT',
        token: jwtWithSub('user_initiator'),
        tokenType: 'jwt',
      }),
    ).toBeUndefined();
  });

  it('leaves a missing login to the caller', () => {
    expect(checkRunIdentity(stored(undefined))).toBeUndefined();
  });

  it('does nothing outside a dispatched run', () => {
    vi.stubEnv('LOBEHUB_RUN_USER_ID', '');

    expect(checkRunIdentity(stored(jwtWithSub('user_device_owner')))).toBeUndefined();
  });
});
