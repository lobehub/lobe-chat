import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as RefreshModule from '../auth/refresh';

const mockCreateTRPCClient = vi.hoisted(() => vi.fn(() => ({ marker: 'client' })));
const mockHttpLink = vi.hoisted(() => vi.fn((opts: unknown) => opts));

vi.mock('@trpc/client', () => ({
  createTRPCClient: mockCreateTRPCClient,
  httpLink: mockHttpLink,
}));

vi.mock('../auth/refresh', async (importOriginal) => ({
  ...(await importOriginal<typeof RefreshModule>()),
  getValidToken: vi.fn(),
}));

const mockLoadCredentials = vi.hoisted(() => vi.fn<() => { accessToken: string } | null>());

vi.mock('../auth/credentials', () => ({ loadCredentials: mockLoadCredentials }));

vi.mock('../settings', () => ({
  loadActiveWorkspace: () => undefined,
  resolveServerUrl: () => 'https://app.lobehub.com',
}));

const headersOfLastLink = () => {
  const { headers } = mockHttpLink.mock.calls.at(-1)![0] as any;
  return typeof headers === 'function' ? headers() : headers;
};

describe('api/client workspace scoping', () => {
  const originalJwt = process.env.LOBEHUB_JWT;
  const originalWorkspaceId = process.env.LOBEHUB_WORKSPACE_ID;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.LOBEHUB_JWT = 'env-jwt';
    delete process.env.LOBEHUB_WORKSPACE_ID;
  });

  afterEach(() => {
    if (originalJwt === undefined) delete process.env.LOBEHUB_JWT;
    else process.env.LOBEHUB_JWT = originalJwt;

    if (originalWorkspaceId === undefined) delete process.env.LOBEHUB_WORKSPACE_ID;
    else process.env.LOBEHUB_WORKSPACE_ID = originalWorkspaceId;
  });

  /**
   * Regression: the env JWT was copied into the link once, when the client was
   * built. `lh hetero exec` holds its client for the whole run, so a renewed
   * operation token never reached it and every request after the original
   * token's four hours was rejected.
   */
  it('sends a renewed LOBEHUB_JWT on requests from an existing client', async () => {
    const { getTrpcClient } = await import('./client');
    await getTrpcClient();
    expect(headersOfLastLink()).toMatchObject({ 'Oidc-Auth': 'env-jwt' });

    process.env.LOBEHUB_JWT = 'renewed-jwt';
    expect(headersOfLastLink()).toMatchObject({ 'Oidc-Auth': 'renewed-jwt' });
  });

  it('creates an anonymous Lambda client without resolving credentials or workspace headers', async () => {
    delete process.env.LOBEHUB_JWT;
    process.env.LOBEHUB_WORKSPACE_ID = 'workspace-1';
    const { getValidToken } = await import('../auth/refresh');
    const { createPublicLambdaClient } = await import('./client');

    createPublicLambdaClient();

    expect(getValidToken).not.toHaveBeenCalled();
    expect(mockHttpLink).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://app.lobehub.com/trpc/lambda' }),
    );
    expect(headersOfLastLink()).toBeUndefined();
  });

  it('does not attach an environment credential to public downloads', async () => {
    const { createPublicLambdaClient } = await import('./client');

    createPublicLambdaClient();

    expect(headersOfLastLink()).toBeUndefined();
  });

  // The tools router is workspace aware like lambda; without the header every
  // `lh search` ran against personal scope and billed the personal budget.
  it('scopes the tools client to the run workspace', async () => {
    process.env.LOBEHUB_WORKSPACE_ID = 'workspace-1';

    const { getToolsTrpcClient } = await import('./client');
    await getToolsTrpcClient();

    expect(headersOfLastLink()).toMatchObject({ 'X-Workspace-Id': 'workspace-1' });
  });

  it('omits the header for the tools client in personal mode', async () => {
    const { getToolsTrpcClient } = await import('./client');
    await getToolsTrpcClient();

    expect(headersOfLastLink()).not.toHaveProperty('X-Workspace-Id');
  });

  it('caches tools clients per workspace instead of returning the first one forever', async () => {
    const { getToolsTrpcClient } = await import('./client');

    const personal = await getToolsTrpcClient();
    const scoped = await getToolsTrpcClient('workspace-1');
    const scopedAgain = await getToolsTrpcClient('workspace-1');

    expect(mockCreateTRPCClient).toHaveBeenCalledTimes(2);
    expect(scoped).toBe(scopedAgain);
    expect(scoped).not.toBe(personal);
  });
});

/**
 * Regression: in a dispatched run the agent cleared `LOBEHUB_JWT` and retried,
 * so the CLI fell back to the device owner's stored login and wrote an
 * acceptance under that account instead of the run's user.
 */
describe('api/client run identity', () => {
  const jwtWithSub = (sub: string) =>
    `header.${Buffer.from(JSON.stringify({ sub })).toString('base64url')}.signature`;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv('LOBEHUB_JWT', '');
    vi.stubEnv('LOBEHUB_RUN_USER_ID', 'user_initiator');
    const { getValidToken } = await import('../auth/refresh');
    vi.mocked(getValidToken).mockImplementation(async () => ({
      credentials: mockLoadCredentials()!,
      status: 'ok',
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses to fall back to another account's stored login", async () => {
    mockLoadCredentials.mockReturnValue({ accessToken: jwtWithSub('user_device_owner') });
    const { getTrpcClient } = await import('./client');

    await expect(getTrpcClient()).rejects.toThrow(
      /started by user user_initiator.*belongs to user user_device_owner/,
    );
    expect(mockCreateTRPCClient).not.toHaveBeenCalled();
  });

  it("falls back to the stored login when it is the run's user", async () => {
    mockLoadCredentials.mockReturnValue({ accessToken: jwtWithSub('user_initiator') });
    const { getTrpcClient } = await import('./client');

    await getTrpcClient();

    expect(headersOfLastLink()).toMatchObject({ 'Oidc-Auth': jwtWithSub('user_initiator') });
  });
});
