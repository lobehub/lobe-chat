// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentModel } from '@/database/models/agent';
import { ConnectorModel } from '@/database/models/connector';
import { ConnectorToolModel } from '@/database/models/connectorTool';
import { ConnectorToolPermission } from '@/database/schemas';

import { connectorRouter } from '../connector';

vi.mock('@/database/models/agent', () => ({ AgentModel: vi.fn() }));
vi.mock('@/database/models/connector', () => ({ ConnectorModel: vi.fn() }));
vi.mock('@/database/models/connectorTool', () => ({ ConnectorToolModel: vi.fn() }));
vi.mock('@/database/models/plugin', () => ({ PluginModel: vi.fn() }));
vi.mock('@/server/utils/connectorAttribution', () => ({
  resolveConnectorAuthorizerId: (c: { userId?: string }) => c.userId,
  resolveUserDisplayMap: async () => new Map(),
}));
vi.mock('@/server/modules/KeyVaultsEncrypt', () => ({
  KeyVaultsGateKeeper: { initWithEnvKey: async () => ({}) },
}));
vi.mock('@/business/server/trpc-middlewares/workspaceAuth', async () => {
  const mod = await vi.importActual<{ trpc: any }>('@/libs/trpc/lambda/init');
  return {
    requireWorkspaceRoleWhenScoped: () => mod.trpc.middleware(async (opts: any) => opts.next()),
    wsCompatProcedure: mod.trpc.procedure,
  };
});
vi.mock('@/libs/trpc/lambda/middleware', () => ({
  serverDatabase: async (opts: any) =>
    opts.next({ ctx: { ...opts.ctx, serverDB: opts.ctx.serverDB ?? {} } }),
}));

const COUNT = 12;
const MAX_IN_FLIGHT = 5;
const CONNECTOR_ID = '9f1f6f30-0000-4000-8000-000000000001';

/** Wraps an async fn so each call stays pending for a tick and records peak parallelism. */
const tracked = <A extends unknown[], R>(fn: (...args: A) => R) => {
  const stats = { inFlight: 0, peak: 0 };
  const wrapped = vi.fn(async (...args: A) => {
    stats.inFlight += 1;
    stats.peak = Math.max(stats.peak, stats.inFlight);
    await new Promise((resolve) => setTimeout(resolve, 1));
    stats.inFlight -= 1;
    return fn(...args);
  });
  return { stats, wrapped };
};

const connectors = Array.from({ length: COUNT }, (_, i) => ({
  agentId: `agent-${i}`,
  credentials: { secret: 'x' },
  id: `connector-${i}`,
  oidcConfig: { clientId: 'cid', clientSecret: 'shh' },
  userId: 'user_test',
}));

describe('connectorRouter fan-out concurrency', () => {
  let connectorModelMock: any;
  let connectorToolModelMock: any;
  let queryStats: { inFlight: number; peak: number };
  let updateStats: { inFlight: number; peak: number };

  beforeEach(() => {
    vi.clearAllMocks();

    const query = tracked((id: string) => [{ id: `${id}-tool` }]);
    const update = tracked((_id: string, _permission: string) => undefined);
    queryStats = query.stats;
    updateStats = update.stats;

    connectorModelMock = {
      findById: vi.fn().mockResolvedValue({ id: CONNECTOR_ID, userId: 'user_test' }),
      query: vi.fn().mockResolvedValue(connectors),
      queryAllAgentScoped: vi.fn().mockResolvedValue(connectors),
      queryByAgent: vi.fn().mockResolvedValue(connectors),
    };
    connectorToolModelMock = {
      queryByConnector: query.wrapped,
      updatePermission: update.wrapped,
    };

    vi.mocked(ConnectorModel).mockImplementation(function () {
      return connectorModelMock;
    });
    vi.mocked(ConnectorToolModel).mockImplementation(function () {
      return connectorToolModelMock;
    });
    vi.mocked(AgentModel).mockImplementation(function () {
      return {
        getAgentAvatarsByIds: vi.fn(async (ids: string[]) =>
          ids.map((id) => ({ avatar: null, id, name: id, title: id })),
        ),
      } as any;
    });
  });

  const caller = () => connectorRouter.createCaller({ serverDB: {}, userId: 'user_test' } as any);

  const expectOrderedTools = (rows: Array<{ id: string; oidcConfig: any; tools: any }>) => {
    expect(rows.map((r) => r.id)).toEqual(connectors.map((c) => c.id));
    for (const row of rows) {
      expect(row.tools).toEqual([{ id: `${row.id}-tool` }]);
      expect(row.oidcConfig.clientSecret).toBeUndefined();
      expect(row).not.toHaveProperty('credentials');
    }
  };

  it('list keeps connector order and caps tool queries', async () => {
    expectOrderedTools(await caller().list());
    expect(connectorToolModelMock.queryByConnector).toHaveBeenCalledTimes(COUNT);
    expect(queryStats.peak).toBeGreaterThan(1);
    expect(queryStats.peak).toBeLessThanOrEqual(MAX_IN_FLIGHT);
  });

  it('listByAgent keeps connector order and caps tool queries', async () => {
    expectOrderedTools(await caller().listByAgent({ agentId: 'agent-0' }));
    expect(queryStats.peak).toBeGreaterThan(1);
    expect(queryStats.peak).toBeLessThanOrEqual(MAX_IN_FLIGHT);
  });

  it('listAgentBound keeps connector order and caps tool queries', async () => {
    const rows = await caller().listAgentBound();
    expectOrderedTools(rows);
    expect(rows.map((r) => r.agentTitle)).toEqual(connectors.map((c) => c.agentId));
    expect(queryStats.peak).toBeGreaterThan(1);
    expect(queryStats.peak).toBeLessThanOrEqual(MAX_IN_FLIGHT);
  });

  it('resetPermissions resets every tool with capped parallel writes', async () => {
    connectorToolModelMock.queryByConnector = vi
      .fn()
      .mockResolvedValue(Array.from({ length: COUNT }, (_, i) => ({ id: `tool-${i}` })));

    const res = await caller().resetPermissions({ id: CONNECTOR_ID });

    expect(res).toEqual({ toolCount: COUNT });
    for (let i = 0; i < COUNT; i++) {
      expect(connectorToolModelMock.updatePermission).toHaveBeenCalledWith(
        `tool-${i}`,
        ConnectorToolPermission.auto,
      );
    }
    expect(updateStats.peak).toBeGreaterThan(1);
    expect(updateStats.peak).toBeLessThanOrEqual(MAX_IN_FLIGHT);
  });
});
