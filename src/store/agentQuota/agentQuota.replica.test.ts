/**
 * @vitest-environment happy-dom
 *
 * Agent quota replicas: the account pool, bindings, readings, calendar history
 * and the last quota-panel snapshot paint from IndexedDB on a reload, then
 * converge on the server (or the live sampler) in the background.
 */
import { randomUUID } from 'node:crypto';

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement, useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheScope, REPLICA_INDEX_KEY } from '@/libs/replica';
import { setScopedMutate } from '@/libs/swr/mutate';
import { agentQuotaService } from '@/services/agentQuota';

import { QUOTA_READ_DEDUPE_MS } from './action';
import { agentQuotaSelectors, useAgentQuotaStore } from './index';
import { initialState } from './initialState';
import {
  hashQuotaSourceKey,
  QUOTA_ACCOUNTS_KEY,
  type QuotaAccount,
  quotaAccountsResource,
  type QuotaBinding,
  quotaBindingsResource,
  type QuotaHistory,
  quotaHistoryResource,
  quotaPanelResource,
  type QuotaPanelSnapshot,
} from './projection';

const MutateBridge = () => {
  const { mutate } = useSWRConfig();
  useEffect(() => setScopedMutate(mutate), [mutate]);
  return null;
};

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    createElement(MutateBridge),
    children,
  );

const account = (id: string, overrides: Partial<QuotaAccount> = {}): QuotaAccount =>
  ({
    credentialMode: 'referenced',
    credentialRef: { path: '/Users/me/.claude/.credentials.json' },
    email: `${id}@example.com`,
    externalAccountId: `ext-${id}`,
    id,
    label: null,
    metadata: null,
    provider: 'claude-code',
    tokenExpiresAt: new Date(0),
    updatedAt: new Date(1),
    ...overrides,
  }) as unknown as QuotaAccount;

const binding = (id: string, accountId: string, role: string): QuotaBinding =>
  ({ accountId, agentId: 'agent-1', id, role }) as unknown as QuotaBinding;

const panel = (usedPercent: number, overrides: Record<string, unknown> = {}) =>
  ({
    error: null,
    provider: 'claude-code',
    session: { resetsAt: null, usedPercent, windowMinutes: 300 },
    status: 'ok',
    updatedAt: 1000,
    ...overrides,
  }) as QuotaPanelSnapshot;

/** Never-resolving request: the first frame can only come from storage. */
const pending = () => new Promise<never>(() => {});

const tick = () => new Promise((resolve) => setTimeout(resolve, 30));

describe('agent quota replicas', () => {
  let scope = '';

  const storedRow = async <T>(
    resource: { storage?: { get: (key: any) => Promise<any> } },
    queryKey: string,
    inScope = scope,
  ) => (await resource.storage!.get({ queryKey, scope: inScope }))?.data as T | undefined;

  const persistRow = (
    resource: { storage?: { set: (key: any, row: any) => Promise<unknown> } },
    queryKey: string,
    data: unknown,
    inScope = scope,
  ) => resource.storage!.set({ queryKey, scope: inScope }, { data, updatedAt: 1 });

  /** A fresh store: what a reload starts from. */
  const reload = () => act(() => useAgentQuotaStore.setState(initialState, false));

  beforeEach(() => {
    scope = `quota-user-${randomUUID()}:personal`;
    vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);
    reload();
  });

  afterEach(async () => {
    cleanup();
    for (const resource of [
      quotaAccountsResource,
      quotaBindingsResource,
      quotaHistoryResource,
      quotaPanelResource,
    ] as { storage?: { remove: (key: any) => Promise<unknown> } }[]) {
      await resource.storage!.remove({ queryKey: REPLICA_INDEX_KEY, scope });
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('quota panel snapshot', () => {
    const SOURCE = JSON.stringify(['claude-code', 'agent-1', 'local', [['TOKEN', 'sk-secret']]]);

    it('paints the last snapshot after a reload before the sampler answers, then replaces it', async () => {
      await persistRow(quotaPanelResource, hashQuotaSourceKey(SOURCE), panel(30));

      renderHook(() => useAgentQuotaStore.getState().useHydrateQuotaPanel(SOURCE), { wrapper });

      await waitFor(() =>
        expect(agentQuotaSelectors.panel(SOURCE)(useAgentQuotaStore.getState())).toMatchObject({
          session: { usedPercent: 30 },
        }),
      );

      act(() =>
        useAgentQuotaStore.getState().setQuotaPanel(SOURCE, panel(55, { updatedAt: 2000 })),
      );

      expect(agentQuotaSelectors.panel(SOURCE)(useAgentQuotaStore.getState())).toMatchObject({
        session: { usedPercent: 55 },
      });
      await waitFor(async () =>
        expect(
          await storedRow<QuotaPanelSnapshot>(quotaPanelResource, hashQuotaSourceKey(SOURCE)),
        ).toMatchObject({ session: { usedPercent: 55 }, updatedAt: 2000 }),
      );
    });

    it('keys storage by a digest, so an env secret in the source never reaches it', async () => {
      renderHook(() => useAgentQuotaStore.getState().useHydrateQuotaPanel(SOURCE), { wrapper });
      act(() => useAgentQuotaStore.getState().setQuotaPanel(SOURCE, panel(10)));

      await waitFor(async () =>
        expect(await storedRow(quotaPanelResource, hashQuotaSourceKey(SOURCE))).toBeDefined(),
      );
      const index = await storedRow<string[]>(quotaPanelResource, REPLICA_INDEX_KEY);
      expect(index).toEqual([hashQuotaSourceKey(SOURCE)]);
      expect(JSON.stringify(index)).not.toContain('sk-secret');
    });

    it('persists only successful snapshots, without a session-only refresh notice', async () => {
      renderHook(() => useAgentQuotaStore.getState().useHydrateQuotaPanel(SOURCE), { wrapper });
      act(() =>
        useAgentQuotaStore
          .getState()
          .setQuotaPanel(SOURCE, panel(10, { refreshUnavailableReason: 'request-blocked' })),
      );
      await waitFor(async () =>
        expect(await storedRow(quotaPanelResource, hashQuotaSourceKey(SOURCE))).toBeDefined(),
      );
      expect(
        await storedRow<Record<string, unknown>>(quotaPanelResource, hashQuotaSourceKey(SOURCE)),
      ).not.toHaveProperty('refreshUnavailableReason');

      // An error / unavailable state is a current fact: it never replays after a reload.
      act(() =>
        useAgentQuotaStore
          .getState()
          .setQuotaPanel(SOURCE, panel(0, { error: 'boom', session: null, status: 'error' })),
      );
      await waitFor(async () =>
        expect(await storedRow(quotaPanelResource, hashQuotaSourceKey(SOURCE))).toBeUndefined(),
      );
    });

    it('drops a sample captured under the previous identity', async () => {
      renderHook(() => useAgentQuotaStore.getState().useHydrateQuotaPanel(SOURCE), { wrapper });
      const previousScope = scope;
      scope = `quota-user-${randomUUID()}:personal`;

      act(() => useAgentQuotaStore.getState().setQuotaPanel(SOURCE, panel(10), previousScope));

      expect(agentQuotaSelectors.panel(SOURCE)(useAgentQuotaStore.getState())).toBeUndefined();
    });
  });

  describe('account pool', () => {
    it('paints persisted accounts before the network answers, then takes the server list', async () => {
      await persistRow(quotaAccountsResource, QUOTA_ACCOUNTS_KEY, [account('a1')]);
      let release!: (value: QuotaAccount[]) => void;
      vi.spyOn(agentQuotaService, 'listAccounts').mockImplementation(
        () => new Promise((resolve) => (release = resolve)),
      );

      renderHook(() => useAgentQuotaStore.getState().useFetchQuotaAccounts(), { wrapper });

      await waitFor(() =>
        expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())?.[0]?.id).toBe('a1'),
      );
      // Painted from storage only: "no accounts" is not settled yet.
      expect(agentQuotaSelectors.isAccountsConfirmed(scope)(useAgentQuotaStore.getState())).toBe(
        false,
      );

      await act(async () => release([account('a2')]));
      await waitFor(() =>
        expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())?.[0]?.id).toBe('a2'),
      );
      expect(agentQuotaSelectors.isAccountsConfirmed(scope)(useAgentQuotaStore.getState())).toBe(
        true,
      );
    });

    it('persists accounts without their credential reference', async () => {
      vi.spyOn(agentQuotaService, 'listAccounts').mockResolvedValue([account('a1')]);

      renderHook(() => useAgentQuotaStore.getState().useFetchQuotaAccounts(), { wrapper });

      await waitFor(async () =>
        expect(
          (await storedRow<QuotaAccount[]>(quotaAccountsResource, QUOTA_ACCOUNTS_KEY))?.[0]?.id,
        ).toBe('a1'),
      );
      const [row] = (await storedRow<Record<string, unknown>[]>(
        quotaAccountsResource,
        QUOTA_ACCOUNTS_KEY,
      ))!;
      expect(row).not.toHaveProperty('credentialRef');
      expect(row).not.toHaveProperty('tokenExpiresAt');
      expect(row.email).toBe('a1@example.com');
    });

    it('does not show the previous identity its accounts after a switch', async () => {
      const listAccounts = vi
        .spyOn(agentQuotaService, 'listAccounts')
        .mockResolvedValueOnce([account('mine')])
        .mockImplementation(pending);

      const { rerender } = renderHook(() => useAgentQuotaStore.getState().useFetchQuotaAccounts(), {
        wrapper,
      });
      await waitFor(() =>
        expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())?.[0]?.id).toBe('mine'),
      );

      scope = `quota-user-${randomUUID()}:personal`;
      rerender();

      await waitFor(() => expect(listAccounts).toHaveBeenCalledTimes(2));
      expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())).toBeUndefined();
    });

    it('shares one request between the samplers and dedupes reads inside the window', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const listAccounts = vi
        .spyOn(agentQuotaService, 'listAccounts')
        .mockResolvedValue([account('a1')]);
      const state = useAgentQuotaStore.getState();

      // Three panels mounting together (Claude, Codex, Kimi) join one request.
      const results = await Promise.all([
        state.readQuotaAccounts(),
        state.readQuotaAccounts(),
        state.readQuotaAccounts(),
      ]);
      expect(results.map((list) => list[0].id)).toEqual(['a1', 'a1', 'a1']);
      expect(listAccounts).toHaveBeenCalledTimes(1);

      // A later read inside the window answers from the replica.
      await state.readQuotaAccounts();
      expect(listAccounts).toHaveBeenCalledTimes(1);

      // After an ingest the caller asks for a fresh read.
      await state.readQuotaAccounts({ fresh: true });
      expect(listAccounts).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(QUOTA_READ_DEDUPE_MS + 1);
      await state.readQuotaAccounts();
      expect(listAccounts).toHaveBeenCalledTimes(3);
    });

    it('keeps answering with the last accounts when a refresh fails', async () => {
      vi.spyOn(agentQuotaService, 'listAccounts')
        .mockResolvedValueOnce([account('a1')])
        .mockRejectedValue(new Error('offline'));
      const state = useAgentQuotaStore.getState();

      await state.readQuotaAccounts();
      await expect(state.readQuotaAccounts({ fresh: true })).resolves.toMatchObject([{ id: 'a1' }]);
      expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())?.[0]?.id).toBe('a1');
    });

    it('never answers a new identity with the previous identity its accounts', async () => {
      vi.spyOn(agentQuotaService, 'listAccounts')
        .mockResolvedValueOnce([account('theirs')])
        .mockRejectedValue(new Error('offline'));
      await useAgentQuotaStore.getState().readQuotaAccounts();

      // Switch identity; the new identity's first read fails.
      scope = `quota-user-${randomUUID()}:personal`;
      await expect(useAgentQuotaStore.getState().readQuotaAccounts()).rejects.toThrow('offline');
      expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())).toBeUndefined();
    });

    it('renames an account in the replica and its stored copy', async () => {
      vi.spyOn(agentQuotaService, 'listAccounts')
        .mockResolvedValueOnce([account('a1')])
        .mockRejectedValue(new Error('offline'));
      vi.spyOn(agentQuotaService, 'updateAccount').mockResolvedValue(undefined as never);
      renderHook(() => useAgentQuotaStore.getState().useFetchQuotaAccounts(), { wrapper });
      await waitFor(() =>
        expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())).toBeDefined(),
      );

      await act(() => useAgentQuotaStore.getState().renameQuotaAccount('a1', 'Work'));

      expect(agentQuotaSelectors.accounts(useAgentQuotaStore.getState())?.[0]?.label).toBe('Work');
      await waitFor(async () =>
        expect(
          (await storedRow<QuotaAccount[]>(quotaAccountsResource, QUOTA_ACCOUNTS_KEY))?.[0]?.label,
        ).toBe('Work'),
      );
    });
  });

  describe('bindings', () => {
    const seedBindings = async (rows: QuotaBinding[]) => {
      vi.spyOn(agentQuotaService, 'listBindings').mockResolvedValueOnce(rows);
      await useAgentQuotaStore.getState().readQuotaBindings('agent-1');
    };

    it('removes an unbound account from storage, so a reload cannot bring it back', async () => {
      await seedBindings([binding('b1', 'a1', 'pinned'), binding('b2', 'a2', 'pool')]);
      vi.spyOn(agentQuotaService, 'unbindAccount').mockResolvedValue(undefined as never);
      // The follow-up refresh fails: the write must not depend on it.
      vi.spyOn(agentQuotaService, 'listBindings').mockRejectedValue(new Error('offline'));

      await act(() => useAgentQuotaStore.getState().unbindQuotaAccount('agent-1', 'b2'));

      expect(
        agentQuotaSelectors
          .bindings('agent-1')(useAgentQuotaStore.getState())
          ?.map((b) => b.id),
      ).toEqual(['b1']);
      await waitFor(async () =>
        expect(
          (await storedRow<QuotaBinding[]>(quotaBindingsResource, 'agent-1'))?.map((b) => b.id),
        ).toEqual(['b1']),
      );

      reload();
      vi.spyOn(agentQuotaService, 'listBindings').mockImplementation(pending);
      renderHook(() => useAgentQuotaStore.getState().useFetchQuotaBindings('agent-1'), {
        wrapper,
      });
      await waitFor(() =>
        expect(
          agentQuotaSelectors.bindings('agent-1')(useAgentQuotaStore.getState()),
        ).toBeDefined(),
      );
      expect(
        agentQuotaSelectors
          .bindings('agent-1')(useAgentQuotaStore.getState())
          ?.map((b) => b.id),
      ).toEqual(['b1']);
    });

    it('switches the pin on screen at once and rolls back when the server rejects', async () => {
      await seedBindings([binding('b1', 'a1', 'pinned'), binding('b2', 'a2', 'pool')]);
      let reject!: (error: Error) => void;
      vi.spyOn(agentQuotaService, 'switchAccount').mockImplementation(
        () => new Promise((_, fail) => (reject = fail)),
      );

      let switching!: Promise<void>;
      act(() => {
        switching = useAgentQuotaStore.getState().switchQuotaAccount('agent-1', 'a2');
      });
      const roles = () =>
        agentQuotaSelectors
          .bindings('agent-1')(useAgentQuotaStore.getState())
          ?.map((b) => `${b.accountId}:${b.role}`);
      expect(roles()).toEqual(['a1:pool', 'a2:pinned']);

      await act(async () => {
        reject(new Error('denied'));
        await expect(switching).rejects.toThrow('denied');
      });
      expect(roles()).toEqual(['a1:pinned', 'a2:pool']);
    });

    it('lands a newly bound account from the upserted row', async () => {
      await seedBindings([binding('b1', 'a1', 'pinned')]);
      vi.spyOn(agentQuotaService, 'bindAccount').mockResolvedValue(
        binding('b9', 'a9', 'pool') as never,
      );
      vi.spyOn(agentQuotaService, 'listBindings').mockRejectedValue(new Error('offline'));

      await act(() => useAgentQuotaStore.getState().bindQuotaAccount('agent-1', 'a9', 'pool'));

      expect(
        agentQuotaSelectors
          .bindings('agent-1')(useAgentQuotaStore.getState())
          ?.map((b) => b.id),
      ).toEqual(['b1', 'b9']);
    });

    it('loads the bindings before a write made while they were still unloaded', async () => {
      // Persisted accounts painted, but this agent's bindings never loaded.
      expect(
        agentQuotaSelectors.bindings('agent-1')(useAgentQuotaStore.getState()),
      ).toBeUndefined();
      vi.spyOn(agentQuotaService, 'listBindings')
        .mockResolvedValueOnce([binding('b1', 'a1', 'pinned')])
        // The follow-up refresh fails: the confirmed row must still land.
        .mockRejectedValue(new Error('offline'));
      vi.spyOn(agentQuotaService, 'bindAccount').mockResolvedValue(
        binding('b9', 'a9', 'pool') as never,
      );

      await act(() => useAgentQuotaStore.getState().bindQuotaAccount('agent-1', 'a9', 'pool'));

      expect(
        agentQuotaSelectors
          .bindings('agent-1')(useAgentQuotaStore.getState())
          ?.map((b) => `${b.accountId}:${b.role}`),
      ).toEqual(['a1:pinned', 'a9:pool']);
    });
  });

  describe('calendar history', () => {
    it('treats a hydrated empty history as unconfirmed until the server answers', async () => {
      const empty: QuotaHistory = { snapshots: [], usageTurns: [], windows: [] };
      await persistRow(quotaHistoryResource, 'a1', empty);
      let release!: (value: unknown[]) => void;
      vi.spyOn(agentQuotaService, 'getWindows').mockImplementation(
        () => new Promise((resolve) => (release = resolve)) as never,
      );
      vi.spyOn(agentQuotaService, 'listSnapshots').mockResolvedValue([]);
      vi.spyOn(agentQuotaService, 'listUsageTurns').mockResolvedValue([]);

      renderHook(() => useAgentQuotaStore.getState().useFetchQuotaHistory('a1'), { wrapper });

      await waitFor(() =>
        expect(agentQuotaSelectors.history('a1')(useAgentQuotaStore.getState())).toEqual(empty),
      );
      await tick();
      expect(
        agentQuotaSelectors.isHistoryConfirmed(scope, 'a1')(useAgentQuotaStore.getState()),
      ).toBe(false);

      await act(async () => release([]));
      await waitFor(() =>
        expect(
          agentQuotaSelectors.isHistoryConfirmed(scope, 'a1')(useAgentQuotaStore.getState()),
        ).toBe(true),
      );
    });

    it('keeps the parts that answered when one history request fails', async () => {
      const snapshot = { capturedAt: 1, limitType: 'session', scopeKey: '', utilization: 5 };
      const turn = { occurredAt: 1 };
      await persistRow(quotaHistoryResource, 'a1', {
        snapshots: [],
        usageTurns: [turn],
        windows: [],
      });
      let release!: (value: unknown[]) => void;
      vi.spyOn(agentQuotaService, 'getWindows').mockImplementation(
        () => new Promise((resolve) => (release = resolve)) as never,
      );
      vi.spyOn(agentQuotaService, 'listSnapshots').mockResolvedValue([snapshot] as never);
      vi.spyOn(agentQuotaService, 'listUsageTurns').mockRejectedValue(new Error('flaky'));

      const { result } = renderHook(
        () => useAgentQuotaStore.getState().useFetchQuotaHistory('a1'),
        { wrapper },
      );
      await waitFor(() =>
        expect(agentQuotaSelectors.history('a1')(useAgentQuotaStore.getState())).toBeDefined(),
      );
      await act(async () => release([{ id: 'w1' }]));

      await waitFor(() =>
        expect(agentQuotaSelectors.history('a1')(useAgentQuotaStore.getState())).toEqual({
          snapshots: [snapshot],
          // The failed part keeps its last confirmed value.
          usageTurns: [turn],
          windows: [{ id: 'w1' }],
        }),
      );
      expect(result.current.error).toBeFalsy();
      expect(
        agentQuotaSelectors.isHistoryConfirmed(scope, 'a1')(useAgentQuotaStore.getState()),
      ).toBe(true);
    });

    it('refreshes a loaded history when an ingest re-reads the readings', async () => {
      const before = { snapshots: [], usageTurns: [], windows: [{ id: 'w-old' }] };
      vi.spyOn(agentQuotaService, 'getWindows')
        .mockResolvedValueOnce(before.windows as never)
        .mockResolvedValue([{ id: 'w-new' }] as never);
      vi.spyOn(agentQuotaService, 'listSnapshots').mockResolvedValue([]);
      vi.spyOn(agentQuotaService, 'listUsageTurns').mockResolvedValue([]);
      vi.spyOn(agentQuotaService, 'getLatestReadings').mockResolvedValue([]);
      renderHook(() => useAgentQuotaStore.getState().useFetchQuotaHistory('a1'), { wrapper });
      await waitFor(() =>
        expect(agentQuotaSelectors.history('a1')(useAgentQuotaStore.getState())).toEqual(before),
      );

      await useAgentQuotaStore.getState().readQuotaReadings('a1', { fresh: true });

      await waitFor(() =>
        expect(agentQuotaSelectors.history('a1')(useAgentQuotaStore.getState())?.windows).toEqual([
          { id: 'w-new' },
        ]),
      );
    });

    it('keeps the last history on screen when a refresh fails', async () => {
      const history = {
        snapshots: [{ capturedAt: 1, limitType: 'session', scopeKey: '', utilization: 5 }],
        usageTurns: [],
        windows: [],
      } as unknown as QuotaHistory;
      await persistRow(quotaHistoryResource, 'a1', history);
      vi.spyOn(agentQuotaService, 'getWindows').mockRejectedValue(new Error('offline'));
      vi.spyOn(agentQuotaService, 'listSnapshots').mockRejectedValue(new Error('offline'));
      vi.spyOn(agentQuotaService, 'listUsageTurns').mockRejectedValue(new Error('offline'));

      const { result } = renderHook(
        () => useAgentQuotaStore.getState().useFetchQuotaHistory('a1'),
        { wrapper },
      );

      await waitFor(() => expect(result.current.error).toBeTruthy());
      expect(agentQuotaSelectors.history('a1')(useAgentQuotaStore.getState())).toEqual(history);
    });
  });
});
