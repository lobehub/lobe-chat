import isEqual from 'fast-deep-equal';
import { type StateCreator } from 'zustand';

import { createReplicaSlice, recordLens, type ReplicaSyncResult } from '@/libs/replica';
import { agentQuotaService } from '@/services/agentQuota';
import { type StoreSetter } from '@/store/types';
import { flattenActions } from '@/store/utils/flattenActions';

import { initialState, type State } from './initialState';
import {
  hashQuotaSourceKey,
  QUOTA_ACCOUNTS_KEY,
  QUOTA_HISTORY_DAYS,
  QUOTA_HISTORY_WINDOW_LIMIT,
  type QuotaAccount,
  quotaAccountsResource,
  type QuotaBinding,
  quotaBindingsResource,
  type QuotaHistory,
  type QuotaHistoryFetched,
  quotaHistoryResource,
  type QuotaLatestReading,
  quotaPanelResource,
  type QuotaPanelSnapshot,
  quotaReadingsResource,
  toPersistedQuotaAccounts,
  toPersistedQuotaPanel,
} from './projection';

export type Action = Pick<ActionImpl, keyof ActionImpl>;
export type Store = State & Action;

type Setter = StoreSetter<Store>;

/**
 * Panels, the account manager and the calendar all read the same account list
 * and readings. A read inside this window answers from the replica instead of
 * sending another request; writes and explicit refreshes pass `fresh`.
 */
export const QUOTA_READ_DEDUPE_MS = 10_000;

type QuotaResourceName = 'accounts' | 'bindings' | 'history' | 'readings';

interface ReadOptions {
  /** Skip the dedupe window and retire older requests (after a write / ingest). */
  fresh?: boolean;
}

/** Where a settled server answer was captured (`ReplicaEffects` context). */
interface SettleContext {
  key: string;
  scope: string;
}

export const quotaConfirmedKey = (scope: string, resource: QuotaResourceName, key: string) =>
  `${scope}|${resource}|${key}`;

const sameValue = <T>(incoming: T, confirmed: T | undefined) =>
  isEqual(incoming, confirmed) ? undefined : incoming;

const upsertBinding = (bindings: QuotaBinding[], row: QuotaBinding) =>
  bindings.some((binding) => binding.id === row.id || binding.accountId === row.accountId)
    ? bindings.map((binding) =>
        binding.id === row.id || binding.accountId === row.accountId ? row : binding,
      )
    : [...bindings, row];

/**
 * Agent quota (coding agent subscription accounts): the account pool, each
 * agent's bindings, each account's newest readings and calendar history, plus
 * the last snapshot every quota panel rendered. All of it paints from the
 * local replica on a reload and converges on the server in the background.
 */
export class ActionImpl {
  readonly #get: () => Store;
  readonly #set: Setter;
  readonly #accounts;
  readonly #bindings;
  readonly #readings;
  readonly #history;
  readonly #panel;
  /** When each `<scope>|<resource>|<key>` last applied a server answer. */
  readonly #appliedAt = new Map<string, number>();

  constructor(set: Setter, get: () => Store, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;

    const confirmOn = (resource: QuotaResourceName) => ({
      onApplied: (_data: unknown, _params: unknown, context: SettleContext) =>
        this.#markApplied(resource, context),
    });

    this.#accounts = createReplicaSlice(quotaAccountsResource, {
      actionPrefix: 'quotaAccounts',
      effects: confirmOn('accounts'),
      fetcher: () => agentQuotaService.listAccounts(),
      get,
      merge: sameValue,
      set,
      stateKey: 'quotaAccountsReplica',
      toPersisted: toPersistedQuotaAccounts,
      view: recordLens<Store, QuotaAccount[]>('quotaAccountsMap'),
    });
    this.#bindings = createReplicaSlice(quotaBindingsResource, {
      actionPrefix: 'quotaBindings',
      effects: confirmOn('bindings'),
      fetcher: (agentId) => agentQuotaService.listBindings(agentId),
      get,
      merge: sameValue,
      set,
      stateKey: 'quotaBindingsReplica',
      view: recordLens<Store, QuotaBinding[]>('quotaBindingsMap'),
    });
    this.#readings = createReplicaSlice(quotaReadingsResource, {
      actionPrefix: 'quotaReadings',
      effects: confirmOn('readings'),
      fetcher: (accountId) => agentQuotaService.getLatestReadings(accountId),
      get,
      merge: sameValue,
      set,
      stateKey: 'quotaReadingsReplica',
      view: recordLens<Store, QuotaLatestReading[]>('quotaReadingsMap'),
    });
    this.#history = createReplicaSlice(quotaHistoryResource, {
      actionPrefix: 'quotaHistory',
      effects: confirmOn('history'),
      fetcher: async (accountId): Promise<QuotaHistoryFetched> => {
        const [windows, snapshots, usageTurns] = await Promise.allSettled([
          agentQuotaService.getWindows(accountId, QUOTA_HISTORY_WINDOW_LIMIT),
          agentQuotaService.listSnapshots(accountId, QUOTA_HISTORY_DAYS),
          agentQuotaService.listUsageTurns(accountId, QUOTA_HISTORY_DAYS),
        ]);
        // Nothing answered: fail the refresh so the last history stays on screen.
        if ([windows, snapshots, usageTurns].every((result) => result.status === 'rejected'))
          throw (windows as PromiseRejectedResult).reason;
        // A part that failed stays `undefined`; `merge` keeps its last confirmed value.
        return {
          snapshots: snapshots.status === 'fulfilled' ? snapshots.value : undefined,
          usageTurns: usageTurns.status === 'fulfilled' ? usageTurns.value : undefined,
          windows: windows.status === 'fulfilled' ? windows.value : undefined,
        };
      },
      get,
      // One part failing keeps the parts that answered, and that part's last
      // confirmed value (or nothing on a first read).
      merge: (incoming, confirmed) =>
        sameValue<QuotaHistory>(
          {
            snapshots: incoming.snapshots ?? confirmed?.snapshots ?? [],
            usageTurns: incoming.usageTurns ?? confirmed?.usageTurns ?? [],
            windows: incoming.windows ?? confirmed?.windows ?? [],
          },
          confirmed,
        ),
      set,
      stateKey: 'quotaHistoryReplica',
      view: recordLens<Store, QuotaHistory>('quotaHistoryMap'),
    });
    this.#panel = createReplicaSlice(quotaPanelResource, {
      actionPrefix: 'quotaPanel',
      get,
      set,
      stateKey: 'quotaPanelReplica',
      toPersisted: toPersistedQuotaPanel,
      view: recordLens<Store, QuotaPanelSnapshot>('quotaPanelMap'),
    });
  }

  // ---- sync hooks (fetch orchestration only; data comes from selectors) ----

  useFetchQuotaAccounts = (enabled = true): ReplicaSyncResult =>
    this.#accounts.useSync(enabled ? QUOTA_ACCOUNTS_KEY : null, {
      dedupingInterval: QUOTA_READ_DEDUPE_MS,
      revalidateOnFocus: false,
    });

  useFetchQuotaBindings = (agentId?: string | null): ReplicaSyncResult =>
    this.#bindings.useSync(agentId || null, {
      dedupingInterval: QUOTA_READ_DEDUPE_MS,
      revalidateOnFocus: false,
    });

  useFetchQuotaReadings = (accountId?: string | null): ReplicaSyncResult =>
    this.#readings.useSync(accountId || null, {
      dedupingInterval: QUOTA_READ_DEDUPE_MS,
      revalidateOnFocus: false,
    });

  useFetchQuotaHistory = (accountId?: string | null): ReplicaSyncResult =>
    this.#history.useSync(accountId || null, {
      dedupingInterval: QUOTA_READ_DEDUPE_MS,
      revalidateOnFocus: false,
    });

  /**
   * Hydrate the last snapshot a quota panel rendered for `sourceKey`. The panel
   * samples live quota itself (desktop IPC / device RPC), so this replica has
   * no fetcher: it only paints from storage and persists what the panel writes
   * back through `setQuotaPanel`.
   */
  useHydrateQuotaPanel = (sourceKey: string): ReplicaSyncResult =>
    this.#panel.useSync(hashQuotaSourceKey(sourceKey));

  /** The identity (user + workspace) a panel sample is captured under. */
  getQuotaScope = (): string => quotaPanelResource.scope.get();

  /** Record what a panel now shows; a sample started under another identity is dropped. */
  setQuotaPanel = (
    sourceKey: string,
    snapshot: QuotaPanelSnapshot,
    scope = quotaPanelResource.scope.get(),
  ): void => {
    if (scope !== quotaPanelResource.scope.get()) return;
    this.#panel.update(hashQuotaSourceKey(sourceKey), () => snapshot);
  };

  // ---- reads for the live samplers (no view mounted) ----

  readQuotaAccounts = (options?: ReadOptions): Promise<QuotaAccount[]> =>
    this.#read('accounts', this.#accounts, QUOTA_ACCOUNTS_KEY, 'quotaAccountsMap', options);

  readQuotaBindings = (agentId: string, options?: ReadOptions): Promise<QuotaBinding[]> =>
    this.#read('bindings', this.#bindings, agentId, 'quotaBindingsMap', options);

  /**
   * A `fresh` readings read follows an ingest (local, device-side or a reset),
   * which also appended to the account's snapshot series and windows: refresh a
   * loaded calendar history too instead of leaving it a dedupe window behind.
   */
  readQuotaReadings = (accountId: string, options?: ReadOptions): Promise<QuotaLatestReading[]> => {
    if (options?.fresh && this.#get().quotaHistoryMap[accountId] !== undefined)
      void this.#refresh(this.#history, accountId);
    return this.#read('readings', this.#readings, accountId, 'quotaReadingsMap', options);
  };

  // ---- writes (account manager) ----

  /** Pin one account for an agent (Manual mode); any previous pin drops back to the pool. */
  switchQuotaAccount = async (agentId: string, accountId: string): Promise<void> => {
    const loading = this.#ensureBindings(agentId);
    if (loading) await loading;
    await this.#bindings.optimistic(
      agentId,
      (bindings) =>
        bindings.map((binding) =>
          binding.accountId === accountId
            ? { ...binding, role: 'pinned' }
            : binding.role === 'pinned'
              ? { ...binding, role: 'pool' }
              : binding,
        ),
      () => agentQuotaService.switchAccount(agentId, accountId),
    );
    await this.#refresh(this.#bindings, agentId);
  };

  /** Add an account to an agent's pool, or change its role there. */
  bindQuotaAccount = async (
    agentId: string,
    accountId: string,
    role: 'pinned' | 'pool' | 'disabled',
  ): Promise<void> => {
    const loading = this.#ensureBindings(agentId);
    if (loading) await loading;
    await this.#bindings.optimistic(
      agentId,
      (bindings) =>
        bindings.map((binding) =>
          binding.accountId === accountId ? { ...binding, role } : binding,
        ),
      () => agentQuotaService.bindAccount(agentId, accountId, role),
      {
        // The upserted row is the confirmed value, also for an account that had no binding yet.
        confirm: (row) => (bindings) => (row ? upsertBinding(bindings, row) : bindings),
      },
    );
    await this.#refresh(this.#bindings, agentId);
  };

  /** Drop an account from an agent's pool; the row leaves the replica and its stored copy. */
  unbindQuotaAccount = async (agentId: string, bindingId: string): Promise<void> => {
    const loading = this.#ensureBindings(agentId);
    if (loading) await loading;
    await this.#bindings.optimistic(
      agentId,
      (bindings) => bindings.filter((binding) => binding.id !== bindingId),
      () => agentQuotaService.unbindAccount(bindingId),
    );
    await this.#refresh(this.#bindings, agentId);
  };

  /** Rename an account (an empty label falls back to its email / external id). */
  renameQuotaAccount = async (accountId: string, label: string | undefined): Promise<void> => {
    await this.#accounts.optimistic(
      QUOTA_ACCOUNTS_KEY,
      (accounts) =>
        accounts.map((account) =>
          account.id === accountId ? { ...account, label: label ?? null } : account,
        ),
      () => agentQuotaService.updateAccount(accountId, { label }),
    );
    await this.#refresh(this.#accounts, QUOTA_ACCOUNTS_KEY);
  };

  /**
   * Drop every quota view and confirmation when the data context changes
   * (desktop `refreshUserData` / `disconnectRemoteServer`), even when the next
   * context derives the same scope string; mounted syncs refetch from empty.
   */
  reset = (): void => {
    this.#appliedAt.clear();
    this.#set({ ...initialState }, false, 'resetAgentQuotaStore');
  };

  // ---- internals ----

  /**
   * An optimistic write (and its confirmation) only lands on a loaded view, so
   * load the agent's bindings first: a write made while the persisted accounts
   * already painted but the bindings read is still out would otherwise reach
   * the server and never reach the replica. A loaded view returns nothing, so
   * the optimistic update still paints in the same tick as the click.
   */
  #ensureBindings = (agentId: string): Promise<unknown> | undefined =>
    this.#get().quotaBindingsMap[agentId] === undefined
      ? this.readQuotaBindings(agentId)
      : undefined;

  #markApplied = (resource: QuotaResourceName, { key, scope }: SettleContext) => {
    const id = quotaConfirmedKey(scope, resource, key);
    this.#appliedAt.set(id, Date.now());
    if (this.#get().quotaConfirmed[id]) return;
    this.#set(
      (state) => ({ quotaConfirmed: { ...state.quotaConfirmed, [id]: true } }),
      false,
      'quotaConfirmed',
    );
  };

  /** Re-read an entry after a write; the optimistic value already holds if it fails. */
  #refresh = async (
    slice: { fetch: (params: string, options?: ReadOptions) => Promise<unknown> },
    key: string,
  ) => {
    try {
      await slice.fetch(key, { fresh: true });
    } catch (error) {
      console.error('[agentQuota:refresh]', error);
    }
  };

  #read = async <T>(
    resource: QuotaResourceName,
    slice: {
      ensureScope: (scope: string) => void;
      fetch: (params: string, options?: ReadOptions) => Promise<{ applied: boolean; data: T }>;
    },
    key: string,
    field: 'quotaAccountsMap' | 'quotaBindingsMap' | 'quotaReadingsMap',
    { fresh = false }: ReadOptions = {},
    retried = false,
  ): Promise<T> => {
    const scope = quotaAccountsResource.scope.get();
    // The samplers read with no view mounted: drop a previous identity's
    // entries first, so neither the dedupe nor the failure fallback below can
    // answer with them.
    slice.ensureScope(scope);
    const cached = (this.#get()[field] as Record<string, T>)[key];
    const appliedAt = this.#appliedAt.get(quotaConfirmedKey(scope, resource, key));
    if (
      !fresh &&
      cached !== undefined &&
      appliedAt !== undefined &&
      Date.now() - appliedAt < QUOTA_READ_DEDUPE_MS
    )
      return cached;

    let result: { applied: boolean; data: T };
    try {
      result = await slice.fetch(key, fresh ? { fresh: true } : undefined);
    } catch (error) {
      // A failed refresh keeps answering with the last confirmed value of this
      // identity — never with one an identity switch left behind meanwhile.
      if (cached !== undefined && quotaAccountsResource.scope.get() === scope) return cached;
      throw error;
    }
    if (result.applied) return result.data;

    // The replica dropped this answer: a write's `fresh` read superseded it, the
    // entry was removed, or the identity changed. Answer with what the replica
    // now holds (e.g. the switched pin) instead of the outdated response.
    const current = (this.#get()[field] as Record<string, T>)[key];
    if (current !== undefined && quotaAccountsResource.scope.get() === scope) return current;
    if (retried) throw new Error(`[agentQuota] ${resource} read for "${key}" was superseded`);
    return this.#read(resource, slice, key, field, { fresh: true }, true);
  };
}

export const store: StateCreator<Store> = (...parameters: Parameters<StateCreator<Store>>) => ({
  ...initialState,
  ...flattenActions<Action>([new ActionImpl(...parameters)]),
});
