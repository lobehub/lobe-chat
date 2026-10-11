import { type PreferenceMemorySimple, type UserMemoryItemSimple } from '@lobechat/types';
import { useLayoutEffect, useMemo } from 'react';
import { type SWRResponse } from 'swr';

import { type DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import {
  createReplicaSlice,
  recordLens,
  type ReplicaLens,
  type ReplicaPageResult,
} from '@/libs/replica';
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

  deletePreference = async (id: string): Promise<void> => {
    await memoryCRUDService.deletePreference(id);
    // Drop the row from every loaded page set and persisted projection, and
    // keep a hydrate already in flight from bringing it back.
    this.#list.removeEntity(id);
  };

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
   */
  useFetchPreferences = (params: PreferenceQueryParams): SWRResponse<any> => {
    const q = params.q || undefined;
    const sort = params.sort;

    // Select the query before paint, so a frame never shows another query's rows.
    useLayoutEffect(() => {
      this.resetPreferencesList({ q, sort });
    }, [q, sort]);

    const sync = this.#list.useSync({
      pageSize: params.pageSize ?? PREFERENCE_LIST_PAGE_SIZE,
      q,
      sort,
    });

    const key = preferenceListKey({ q, sort });
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
      isLoading: !data && (sync.isValidating || !sync.isHydrated),
      isValidating: sync.isValidating,
      mutate: sync.revalidate,
    } as unknown as SWRResponse<any>;
  };
}

export type PreferenceAction = Pick<PreferenceActionImpl, keyof PreferenceActionImpl>;
