// @vitest-environment node
import { getTestDB } from '@lobechat/database/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LinearConnectionModel } from '@/database/models/linear';
import {
  linearConnections,
  linearSyncRules,
  users,
  workspaceMembers,
  workspaces,
} from '@/database/schemas';

import { linearRouter } from '../linear';

const serverDB = await getTestDB();
const userId = 'linear-router-user';
const otherUserId = 'linear-router-user-2';

vi.mock('@/envs/linear', () => ({
  linearEnv: { ENABLED_LINEAR: true },
}));

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  listTeams: vi.fn(),
  revoke: vi.fn(),
  syncByFilter: vi.fn(),
}));
vi.mock('@/server/services/linear/client', () => ({
  LINEAR_INSTALL_PATH: '/api/webhooks/linear/install',
  LinearApiError: class LinearApiError extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
    }
  },
  revokeLinearToken: mocks.revoke,
}));
vi.mock('@/server/services/linear/token', () => ({
  getLinearAccessToken: mocks.getToken,
  LinearReconnectRequiredError: class LinearReconnectRequiredError extends Error {},
}));
vi.mock('@/server/services/linear/issues', () => ({
  listLinearProjects: vi.fn(),
  listLinearTeams: mocks.listTeams,
}));
vi.mock('@/server/services/linear/issueSync', () => ({
  LinearIssueSyncService: vi.fn().mockImplementation(function () {
    return { syncByFilter: mocks.syncByFilter };
  }),
}));
vi.mock('@/server/modules/KeyVaultsEncrypt', () => ({
  KeyVaultsGateKeeper: {
    initWithEnvKey: async () => ({
      decrypt: async (ciphertext: string) => ({ plaintext: ciphertext }),
      encrypt: async (plaintext: string) => plaintext,
    }),
  },
}));

vi.mock('@/business/server/trpc-middlewares/workspaceAuth', async () => {
  const mod = await vi.importActual<{ trpc: any }>('@/libs/trpc/lambda/init');
  return { wsCompatProcedure: mod.trpc.procedure };
});

vi.mock('@/libs/trpc/lambda/middleware', () => ({
  serverDatabase: async (opts: any) => opts.next({ ctx: { ...opts.ctx, serverDB } }),
}));

const caller = (ctx: { userId: string; workspaceId?: string | null }) =>
  linearRouter.createCaller({ ...ctx, serverDB } as any);

const connect = (scope: { userId: string; workspaceId?: string | null }) =>
  LinearConnectionModel.upsert(serverDB, {
    actorExternalId: 'linear-user',
    actorName: 'Ada',
    credentials: { accessToken: 'token' },
    organizationId: 'org-1',
    organizationName: 'Acme',
    organizationUrlKey: 'acme',
    ...scope,
  });

beforeEach(async () => {
  vi.clearAllMocks();
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
});

afterEach(async () => {
  await serverDB.delete(linearSyncRules);
  await serverDB.delete(linearConnections);
  await serverDB.delete(workspaces);
  await serverDB.delete(users);
});

describe('linearRouter', () => {
  it('reports the connect configuration', async () => {
    expect(await caller({ userId }).getConfig()).toEqual({
      enabled: true,
      installPath: '/api/webhooks/linear/install',
    });
  });

  it('lists only the caller scope, without credentials', async () => {
    await connect({ userId });
    await connect({ userId: otherUserId });

    const list = await caller({ userId }).listConnections();

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ organizationName: 'Acme', userId });
    expect(list[0]).not.toHaveProperty('credentials');
  });

  it("refuses to disconnect another user's connection", async () => {
    const other = await connect({ userId: otherUserId });

    await expect(caller({ userId }).disconnect({ connectionId: other.id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(mocks.revoke).not.toHaveBeenCalled();
  });

  it('lets workspace members disconnect a shared connection but not viewers', async () => {
    const [workspace] = await serverDB
      .insert(workspaces)
      .values({ name: 'ws', primaryOwnerId: otherUserId, slug: 'linear-router-ws' })
      .returning();
    const connection = await connect({ userId: otherUserId, workspaceId: workspace.id });
    await serverDB
      .insert(workspaceMembers)
      .values({ role: 'viewer', userId, workspaceId: workspace.id });
    const input = { connectionId: connection.id };

    await expect(
      caller({ userId, workspaceId: workspace.id }).disconnect(input),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    await serverDB.update(workspaceMembers).set({ role: 'member' });
    await expect(caller({ userId, workspaceId: workspace.id }).disconnect(input)).resolves.toEqual({
      ok: true,
    });
  });

  it('disconnects: revokes the token at Linear and hides the connection', async () => {
    const connection = await connect({ userId });

    await caller({ userId }).disconnect({ connectionId: connection.id });

    expect(mocks.revoke).toHaveBeenCalledWith({ accessToken: 'token' }, null);
    expect(await caller({ userId }).listConnections()).toEqual([]);
    await expect(
      caller({ userId }).disconnect({ connectionId: connection.id }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  describe('issue sync', () => {
    const syncResult = {
      closed: 0,
      created: 2,
      keptLocalEdits: 0,
      skipped: [],
      truncated: false,
      unchanged: 0,
      updated: 0,
    };

    it("does not read Linear through another scope's connection", async () => {
      const other = await connect({ userId: otherUserId });

      await expect(caller({ userId }).listTeams({ connectionId: other.id })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      expect(mocks.getToken).not.toHaveBeenCalled();
    });

    it('asks to reconnect when Linear rejects the token', async () => {
      const connection = await connect({ userId });
      const { LinearApiError } = await import('@/server/services/linear/client');
      mocks.getToken.mockResolvedValue('token');
      mocks.listTeams.mockRejectedValue(new LinearApiError('Linear API error: Unauthorized', 401));

      await expect(
        caller({ userId }).listTeams({ connectionId: connection.id }),
      ).rejects.toMatchObject({
        code: 'PRECONDITION_FAILED',
        message: 'LINEAR_RECONNECT_REQUIRED',
      });
    });

    it('saves a rule, runs it with its filter and records the outcome', async () => {
      const connection = await connect({ userId });
      mocks.getToken.mockResolvedValue('token');
      mocks.syncByFilter.mockResolvedValue(syncResult);

      const rule = await caller({ userId }).createSyncRule({
        connectionId: connection.id,
        stateTypes: ['backlog', 'unstarted'],
        teamId: 'team-1',
        teamName: 'Engineering',
      });
      const result = await caller({ userId }).runSyncRule({ ruleId: rule.id });

      expect(result).toEqual(syncResult);
      expect(mocks.syncByFilter).toHaveBeenCalledWith(
        'token',
        { linearProjectId: null, stateTypes: ['backlog', 'unstarted'], teamId: 'team-1' },
        { targetProjectId: null },
      );
      const [saved] = await caller({ userId }).listSyncRules();
      expect(saved).toMatchObject({ id: rule.id, lastResult: syncResult, teamName: 'Engineering' });
      expect(saved.lastRunAt).toBeInstanceOf(Date);
    });

    it("hides another user's personal rules", async () => {
      const connection = await connect({ userId: otherUserId });
      const rule = await caller({ userId: otherUserId }).createSyncRule({
        connectionId: connection.id,
        stateTypes: ['backlog'],
        teamId: 'team-1',
        teamName: 'Engineering',
      });

      expect(await caller({ userId }).listSyncRules()).toEqual([]);
      await expect(caller({ userId }).runSyncRule({ ruleId: rule.id })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      await expect(caller({ userId }).deleteSyncRule({ ruleId: rule.id })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('rejects a target project the caller cannot see', async () => {
      const connection = await connect({ userId });

      await expect(
        caller({ userId }).createSyncRule({
          connectionId: connection.id,
          stateTypes: ['backlog'],
          targetProjectId: 'proj_missing',
          teamId: 'team-1',
          teamName: 'Engineering',
        }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });
});
