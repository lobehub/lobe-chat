import { type PreferenceMemorySimple, type UserMemoryItemSimple } from '@lobechat/types';
import { useLayoutEffect, useMemo } from 'react';
import { type SWRResponse } from 'swr';

import { type DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import {
  createReplicaSlice,
  readReplicaStoredKeys,
  recordLens,
  type ReplicaLens,
  type ReplicaPageResult,
} from '@/libs/replica';
import { mutate } from '@/libs/swr';
import { userMemoryKeys } from '@/libs/swr/keys';
import { memoryCRUDService, userMemoryService } from '@/services/userMemory';
import { type StoreSetter } from '@/store/types';
import { LayersEnum } from '@/types/userMemory';
import { setNamespace } from '@/utils/storeDebug';

import { type UserMemoryStore, useUserMemoryStore } from '../../store';
import {
  PREFERENCE_LIST_PAGE_SIZE,
  type PreferenceListData,
  preferenceListKey,
  type PreferenceListParams,
  preferenceListResource,
  type PreferenceListSort,
} from './projection';

const n = setNamespace('userMemory/preference');

/**
 * How many distinct search / sort query entries keep a replica page set. The
 * query on screen is always the most recent, so bounding the window bounds
 * memory and IndexedDB together: searching all day cannot grow either without
 * limit, and the queries just used still paint from their own rows.
 */
export const MAX_RECENT_PREFERENCE_QUERIES = 8;

export interface PreferenceQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: PreferenceListSort;
}

/** Flat mirrors of one page set (`undefined` = the active query has no view yet). */
const mirrorsOf = (data: PreferenceListData | undefined): Partial<UserMemoryStore> =>
  data
    ? {
        preferenceListData: data,
        preferences: data.items,
        preferencesHasMore: data.hasMore,
        preferencesInit: true,
        preferencesPage: data.currentPage + 1,
        preferencesTotal: data.total ?? data.items.length,
      }
    : {
        preferenceListData: undefined,
        preferences: [],
        preferencesHasMore: true,
        preferencesInit: false,
        preferencesPage: 1,
        preferencesTotal: 0,
      };

const entriesLens = recordLens<UserMemoryStore, PreferenceListData>('preferenceListEntries');

/**
 * The canonical replica value is `preferenceListEntries` — one page set per
 * search / sort (see `preferenceListKey`). The long-standing flat fields
 * (`preferenceListData`, `preferences`, `preferencesTotal`, `preferencesPage`,
 * `preferencesHasMore`, `preferencesInit`) mirror the entry of the active query
 * (`preferenceListKey`), so no consumer changes and a write to any entry keeps
 * the mirrors in the same commit.
 */
const preferenceListLens: ReplicaLens<UserMemoryStore, PreferenceListData> = {
  clear: (state) => ({ ...entriesLens.clear(state), ...mirrorsOf(undefined) }),
  get: entriesLens.get,
  keys: entriesLens.keys,
  set: (state, key, data) => ({
    ...entriesLens.set(state, key, data),
    ...(key === state.preferenceListKey ? mirrorsOf(data) : undefined),
  }),
};

/**
 * Flatten a `queryMemories` row into the display shape the preference list
 * renders. The endpoint returns `{ memory, preference }`; the row is merged in
 * the same order the previous slice did.
 */
const toDisplayPreference = (item: UserMemoryItemSimple): DisplayPreferenceMemory => {
  const { memory, preference } = item as PreferenceMemorySimple;
  return { ...memory, ...preference } as unknown as DisplayPreferenceMemory;
};

type Setter = StoreSetter<UserMemoryStore>;
export const createPreferenceSlice = (set: Setter, get: () => UserMemoryStore, _api?: unknown) =>
  new PreferenceActionImpl(set, get, _api);

/**
 * The user-memory preference list.
 *
 * Server state is one `@lobechat/replica` paged resource (`preferenceList`)
 * keyed per search / sort: each query paints its persisted head page on the
 * first frame and the network confirms it in the background. The domain store
 * exposes the same flat fields it always has, mirrored from the active query's
 * entry, so the memory preference page and its components are untouched.
 */
export class PreferenceActionImpl {
  readonly #get: () => UserMemoryStore;
  readonly #list;
  readonly #set: Setter;
  /** Entry keys used, oldest first (see `#trackRecentQuery`). */
  #recentQueries: string[] = [];
  /** Identity the recency list belongs to (see `#seedRecentQueries`). */
  #recentScope?: string;
  /** Whether the persisted keys are already folded into the recency list. */
  #recentsSeeded = false;

  constructor(set: Setter, get: () => UserMemoryStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
    this.#list = createReplicaSlice(preferenceListResource, {
      actionPrefix: n('preferenceList'),
      fetcher: (params, cursor) => this.#fetchPage(params, cursor),
      get,
      set,
      stateKey: 'preferenceListReplica',
      view: preferenceListLens,
      // Keep the painted page set self-describing (which query it answers).
      viewFields: ({ q, sort }) => ({ q: q || undefined, sort }),
    });
  }

  /** One page of the preference list; `cursor` is the page index (0 = head). */
  #fetchPage = async (
    params: PreferenceListParams,
    cursor?: number,
  ): Promise<ReplicaPageResult<DisplayPreferenceMemory, number>> => {
    const response = await userMemoryService.queryMemories({
      layer: LayersEnum.Preference,
      page: (cursor ?? 0) + 1,
      pageSize: params.pageSize,
      q: params.q,
      sort: params.sort,
    });

    return { items: response.items.map(toDisplayPreference), total: response.total };
  };

  /** Drop the oldest query page sets past {@link MAX_RECENT_PREFERENCE_QUERIES}. */
  #evictOldQueries = (): void => {
    while (this.#recentQueries.length > MAX_RECENT_PREFERENCE_QUERIES) {
      const oldest = this.#recentQueries.shift();
      // Drops the entry (memory) and every persisted row of that query, so the
      // store and IndexedDB stay bounded together.
      if (oldest) this.#list.remove(oldest);
    }
  };

  /**
   * Fold the keys an earlier session persisted into the recency list, once per
   * scope. {@link MAX_RECENT_PREFERENCE_QUERIES} only bounds what the list knows
   * about, and a list that starts empty on every page load bounds nothing
   * across reloads: each session would persist up to the cap again while the
   * rows of every session before it stayed in IndexedDB.
   */
  #seedRecentQueries = (): void => {
    const scope = preferenceListResource.scope.get();
    if (this.#recentScope !== scope) {
      // Another identity owns the partition: the keys this list learned stood
      // for the previous scope's rows, so start the window over for this one.
      this.#recentQueries = [];
      this.#recentScope = scope;
      this.#recentsSeeded = false;
    }
    if (this.#recentsSeeded) return;
    this.#recentsSeeded = true;

    void readReplicaStoredKeys(preferenceListResource).then((persisted) => {
      // A scope switch while the index was read voids this seed.
      if (this.#recentScope !== scope) return;
      // The index is append-ordered (oldest first); prepending keeps that order,
      // so eviction — which takes from the front — drops the least recently used
      // persisted query first.
      for (const persistedKey of [...persisted].reverse()) {
        if (!this.#recentQueries.includes(persistedKey)) this.#recentQueries.unshift(persistedKey);
      }
      this.#evictOldQueries();
    });
  };

  /**
   * Remember the query the user is looking at, dropping the oldest ones past
   * {@link MAX_RECENT_PREFERENCE_QUERIES}. Called from a layout effect, never
   * during render.
   */
  #trackRecentQuery = (key: string): void => {
    this.#seedRecentQueries();
    const existing = this.#recentQueries.indexOf(key);
    if (existing !== -1) this.#recentQueries.splice(existing, 1);
    this.#recentQueries.push(key);
    this.#evictOldQueries();
  };

  deletePreference = async (id: string): Promise<void> => {
    await memoryCRUDService.deletePreference(id);
    // Drop the row from every loaded page set and persisted projection, and
    // keep a hydrate already in flight from bringing it back.
    this.#list.removeEntity(id);
    // An offset-paged list shifts on the server once a row is gone, so the local
    // next-page cursor would step over the row that slid into the deleted row's
    // place. Collapse to the head and refetch it, so the next page continues
    // from a fresh, contiguous head instead of a stale offset.
    this.#list.collapse(this.#get().preferenceListKey);
    await this.#revalidateList();
  };

  /**
   * Revalidate the mounted preference list. The resource syncs under the custom
   * `userMemoryKeys.preferences(...)` SWR key, which the replica's own
   * `revalidate()` (it matches `replica:sync` keys only) never reaches.
   */
  #revalidateList = (): Promise<unknown> =>
    mutate((key) => Array.isArray(key) && key[0] === userMemoryKeys.preferences.root);

  /**
   * Wipe every preference page set — every search / sort, in memory and in
   * IndexedDB — through the engine. Used by the memory purge; `clear()` does not
   * refetch, so the caller revalidates afterwards. Resolves `true` once the
   * persisted rows are gone.
   */
  internal_clearPreferenceList = (): Promise<boolean> => this.#list.clear();

  /**
   * Apply a confirmed edit to one preference in every loaded page set and its
   * persisted projection, so the canonical replica value (not only the flat
   * mirror) carries it across a later load-more, revalidation or reload.
   */
  internal_updatePreferenceEntity = (
    id: string,
    fn: (item: DisplayPreferenceMemory) => DisplayPreferenceMemory | undefined,
  ): void => {
    this.#list.updateEntity(id, fn);
  };

  /**
   * Append the next page of the active query's list. The engine reads the
   * loaded head params, dedupes by id and keeps `hasMore` honest.
   */
  loadMorePreferences = (): void => {
    void this.#list.loadMore(this.#get().preferenceListKey);
  };

  /**
   * Point the flat mirrors at another search / sort. Each query keeps its own
   * entry, so this never drops a page set: a query loaded before repaints from
   * memory, one persisted before hydrates from storage, and a new one shows the
   * loading state until its head page lands. A no-op when the query is
   * unchanged.
   */
  resetPreferencesList = (params?: Omit<PreferenceQueryParams, 'page' | 'pageSize'>): void => {
    const nextQuery = params?.q || undefined;
    const nextSort = params?.sort;
    const key = preferenceListKey({ q: nextQuery, sort: nextSort });
    const state = this.#get();
    if (state.preferenceListKey === key) return;

    this.#set(
      {
        preferenceListKey: key,
        preferencesQuery: nextQuery,
        preferencesSort: nextSort,
        ...mirrorsOf(preferenceListLens.get(state, key)),
      },
      false,
      n('resetPreferencesList'),
    );
  };

  /**
   * Fetch orchestration for the memory preference list. Returns an
   * `SWRResponse`-shaped result — `data` reads the active query's replica view —
   * so the existing consumers (which pass it to `MemoryListBoundary`) are
   * untouched; the rows land in the store mirrors, never in this return value.
   *
   * `error` is the failure of the request for the query on screen (a
   * superseded search settles under its own key), and only while that query has
   * nothing painted: a failed background revalidation keeps its rows.
   *
   * `isLoading` covers both phases the list views draw a footer for: a head load
   * that has no rows yet, and a "load more" whose rows stay mounted under an
   * incremental footer (the active view's `isLoadingMore`).
   */
  useFetchPreferences = (params: PreferenceQueryParams): SWRResponse<any> => {
    const q = params.q || undefined;
    const sort = params.sort;
    const key = preferenceListKey({ q, sort });

    // Select the query before paint, so a frame never shows another query's rows.
    useLayoutEffect(() => {
      this.resetPreferencesList({ q, sort });
      this.#trackRecentQuery(preferenceListKey({ q, sort }));
    }, [q, sort]);

    const sync = this.#list.useSync({
      pageSize: params.pageSize ?? PREFERENCE_LIST_PAGE_SIZE,
      q,
      sort,
    });

    const view = useUserMemoryStore((state) => state.preferenceListEntries[key]);
    const data = useMemo(
      () =>
        view
          ? {
              items: view.items,
              page: view.currentPage + 1,
              pageSize: view.pageSize,
              total: view.total ?? view.items.length,
            }
          : undefined,
      [view],
    );

    return {
      data,
      error: data ? undefined : sync.error,
      isLoading: !data ? sync.isValidating || !sync.isHydrated : Boolean(view?.isLoadingMore),
      isValidating: sync.isValidating,
      mutate: sync.revalidate,
    } as unknown as SWRResponse<any>;
  };
}

export type PreferenceAction = Pick<PreferenceActionImpl, keyof PreferenceActionImpl>;
