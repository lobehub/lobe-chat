import { discoverAuthorizationServerMetadata } from '@modelcontextprotocol/sdk/client/auth.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as OauthModule from './oauth';
import { refreshConnectorToken } from './oauth';
import { refreshExpiredConnectorTokens } from './tokens';

vi.mock('@modelcontextprotocol/sdk/client/auth.js', () => ({
  discoverAuthorizationServerMetadata: vi.fn(),
}));
vi.mock('./oauth', async (importOriginal) => ({
  ...(await importOriginal<typeof OauthModule>()),
  refreshConnectorToken: vi.fn(),
}));

const NOW = 1_800_000_000_000;

const oauthConnector = (id: string, expiresAt: number) =>
  ({
    credentials: { accessToken: `old-${id}`, expiresAt, refreshToken: 'refresh', type: 'oauth2' },
    id,
    identifier: id,
    mcpServerUrl: 'https://mcp.example.com/mcp',
    oidcConfig: { clientId: 'client', issuer: 'https://auth.example.com' },
  }) as any;

describe('refreshExpiredConnectorTokens', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    vi.mocked(discoverAuthorizationServerMetadata).mockResolvedValue({} as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // LOBE-14771: agent runs baked the stored (expired) token into manifests, so
  // the first call after every expiry 401'd even when it was refreshable.
  it('refreshes an expired token and persists the rotated credentials', async () => {
    vi.mocked(refreshConnectorToken).mockResolvedValue({
      tokens: { access_token: 'new-token', expires_in: 3600, token_type: 'Bearer' },
    } as any);
    const update = vi.fn();

    const [connector] = await refreshExpiredConnectorTokens([oauthConnector('xmind', NOW - 1000)], {
      update,
    } as any);

    expect(connector.credentials).toMatchObject({ accessToken: 'new-token' });
    expect(update).toHaveBeenCalledWith(
      'xmind',
      expect.objectContaining({ tokenExpiresAt: new Date(NOW + 3_600_000) }),
    );
  });

  it('leaves a valid token alone without contacting the authorization server', async () => {
    const valid = oauthConnector('valid', NOW + 3_600_000);

    const result = await refreshExpiredConnectorTokens([valid], { update: vi.fn() } as any);

    expect(result).toEqual([valid]);
    expect(discoverAuthorizationServerMetadata).not.toHaveBeenCalled();
  });

  it('keeps the stored credentials when the authorization server hangs', async () => {
    vi.mocked(refreshConnectorToken).mockReturnValue(new Promise(() => {}));
    const expired = oauthConnector('slow', NOW - 1000);

    const onTimeout = vi.fn();

    const pending = refreshExpiredConnectorTokens([expired], { update: vi.fn() } as any, {
      onTimeout,
    });
    await vi.advanceTimersByTimeAsync(5000);

    expect(await pending).toEqual([expired]);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('keeps the stored credentials when the refresh is rejected', async () => {
    vi.mocked(refreshConnectorToken).mockRejectedValue(new Error('invalid_grant'));
    const expired = oauthConnector('revoked', NOW - 1000);
    const findById = vi.fn().mockResolvedValue(expired);

    const pending = refreshExpiredConnectorTokens([expired], { findById, update: vi.fn() } as any);
    await vi.advanceTimersByTimeAsync(1000);

    expect(await pending).toEqual([expired]);
  });

  it('spends the refresh token once for concurrent runs on one instance', async () => {
    vi.mocked(refreshConnectorToken).mockResolvedValue({
      tokens: { access_token: 'new-token', expires_in: 3600, token_type: 'Bearer' },
    } as any);
    const model = { update: vi.fn() } as any;
    const expired = oauthConnector('shared', NOW - 1000);

    const [[first], [second]] = await Promise.all([
      refreshExpiredConnectorTokens([expired], model),
      refreshExpiredConnectorTokens([expired], model),
    ]);

    expect(refreshConnectorToken).toHaveBeenCalledTimes(1);
    expect(first.credentials).toMatchObject({ accessToken: 'new-token' });
    expect(second.credentials).toMatchObject({ accessToken: 'new-token' });
  });

  it('uses the token another instance rotated when its own refresh loses the race', async () => {
    vi.mocked(refreshConnectorToken).mockRejectedValue(new Error('invalid_grant'));
    const expired = oauthConnector('raced', NOW - 1000);
    const rotated = {
      ...expired,
      credentials: { accessToken: 'winner', expiresAt: NOW + 3_600_000, type: 'oauth2' },
    };

    const [connector] = await refreshExpiredConnectorTokens([expired], {
      findById: vi.fn().mockResolvedValue(rotated),
      update: vi.fn(),
    } as any);

    expect(connector.credentials).toMatchObject({ accessToken: 'winner' });
  });

  it('waits for a winner that is still persisting the rotated token', async () => {
    vi.mocked(refreshConnectorToken).mockRejectedValue(new Error('invalid_grant'));
    const expired = oauthConnector('persisting', NOW - 1000);
    const rotated = {
      ...expired,
      credentials: { accessToken: 'winner', expiresAt: NOW + 3_600_000, type: 'oauth2' },
    };
    const findById = vi.fn().mockResolvedValueOnce(expired).mockResolvedValueOnce(rotated);

    const pending = refreshExpiredConnectorTokens([expired], { findById, update: vi.fn() } as any);
    await vi.advanceTimersByTimeAsync(1000);

    expect((await pending)[0].credentials).toMatchObject({ accessToken: 'winner' });
    expect(findById).toHaveBeenCalledTimes(2);
  });
});
