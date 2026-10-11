import { type ActivityListItem, type ActivityListResult } from '@lobechat/types';
import { useMemo } from 'react';
import { type SWRResponse } from 'swr';

import {
  cacheScope,
  createReplicaSlice,
  type ReplicaLens,
  type ReplicaPageResult,
} from '@/libs/replica';
import { mutate } from '@/libs/swr';
import { userMemoryKeys } from '@/libs/swr/keys';
import { memoryCRUDService, userMemoryService } from '@/services/userMemory';
import { type StoreSetter } from '@/store/types';
import { setNamespace } from '@/utils/storeDebug';

import { type UserMemoryStore, useUserMemoryStore } from '../../store';
import {
  ACTIVITY_LIST_KEY,
  ACTIVITY_LIST_PAGE_SIZE,
  type ActivityListData,
  type ActivityListParams,
  activityListResource,
  type ActivityListSort,
} from './projection';

const n = setNamespace('userMemory/activity');

export interface ActivityQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: ActivityListSort;
  status?: string[];
  types?: string[];
}

/**
 * The activity list keeps its long-standing flat fields (`activities`,
 * `activitiesTotal`, `activitiesPage`, `activitiesHasMore`, `activitiesInit`)
 * as derived mirrors of the `activityList` replica view, so no consumer changes.
 * The canonical paged value lives in `activityListData` and is persisted to
 * IndexedDB by the replica engine.
 */
const activityListLens: ReplicaLens<UserMemoryStore, ActivityListData> = {
  clear: () => ({
    activities: [],
    activitiesHasMore: true,
    activitiesInit: false,
    activitiesPage: 1,
    // The reset answers a new scope/query: the previous one's error must not
    // outlive it, or the boundary keeps showing it until the next request settles.
    activitiesSearchError: undefined,
    activitiesSearchLoading: undefined,
    activitiesTotal: 0,
    activityListData: undefined,
  }),
  get: (state) => state.activityListData,
  set: (_state, _key, data) => {
    if (!data) {
      return {
        activities: [],
        activitiesHasMore: true,
        activitiesInit: false,
        activitiesPage: 1,
        activitiesSearchError: undefined,
        activitiesTotal: 0,
        activityListData: undefined,
      };
    }
    return {
      activities: data.items,
      activitiesHasMore: data.hasMore,
      activitiesInit: true,
      activitiesPage: data.currentPage + 1,
      // A landed page settles the search: clear the reset/error flags.
      activitiesSearchError: undefined,
      activitiesSearchLoading: false,
      activitiesTotal: data.total ?? data.items.length,
      activityListData: data,
    };
  },
};

type Setter = StoreSetter<UserMemoryStore>;
export const createActivitySlice = (set: Setter, get: () => UserMemoryStore, _api?: unknown) =>
  new ActivityActionImpl(set, get, _api);

/**
 * The user-memory activity list.
 *
 * Server state is one `@lobechat/replica` paged resource (`activityList`): the
 * persisted head page paints on the first frame and the network confirms it in
 * the background. The domain store exposes the same flat fields and the same
 * action surface it always has, backed by the replica view, so the memory
 * activity page and its components are untouched.
 */
export class ActivityActionImpl {
  readonly #get: () => UserMemoryStore;
  /** A delete and its head revalidation in flight; paging waits for it (see `deleteActivity`). */
  #headRefresh: Promise<void> | undefined;
  /**
   * Set once a delete lands on the server, cleared when a head page lands: the
   * loaded next-page offset is stale until then (see `#loadMore`).
   */
  #headStale = false;
  readonly #list;
  readonly #set: Setter;

  constructor(set: Setter, get: () => UserMemoryStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
    this.#list = createReplicaSlice(activityListResource, {
      actionPrefix: n('activityList'),
      fetcher: (params, cursor) => this.#fetchPage(params, cursor),
      get,
      set,
      stateKey: 'activityListReplica',
      view: activityListLens,
      // Keep the painted page set self-describing (which query it answers).
      viewFields: ({ q, sort }) => ({ q: q || undefined, sort }),
    });
  }

  /** One page of the activity list; `cursor` is the page index (0 = head). */
  #fetchPage = async (
    params: ActivityListParams,
    cursor?: number,
  ): Promise<ReplicaPageResult<ActivityListItem, number>> => {
    const response = await userMemoryService.queryActivities({
      page: (cursor ?? 0) + 1,
      pageSize: params.pageSize,
      q: params.q,
      sort: params.sort,
      status: params.status,
      types: params.types,
    });

    return { items: response.items, total: response.total };
  };

  /** Clear the surfaced error once a head page lands. */
  #clearListError = (): void => {
    if (this.#get().activitiesSearchError === undefined) return;
    this.#set({ activitiesSearchError: undefined }, false, n('activities/clearError'));
  };

  /**
   * Surface a failed head/refresh fetch only when there is no settled content
   * to keep (initial load or a reset). A background refresh failure must not
   * replace an already-painted list with an error.
   */
  #surfaceListError = (error: unknown): void => {
    const { activitiesInit, activitiesSearchLoading } = this.#get();
    const surface = Boolean(activitiesSearchLoading) || !activitiesInit;
    this.#set(
      {
        activitiesSearchError: surface ? error : undefined,
        activitiesSearchLoading: false,
      },
      false,
      n('activities/failList'),
    );
  };

  /**
   * Revalidate every mounted activity query. The list syncs under the legacy
   * `userMemory:activities` SWR key (see `projection.ts`), so the replica's own
   * `revalidate()` (which matches `replica:sync` keys) would not reach it.
   */
  #revalidateList = (): Promise<unknown> =>
    mutate((key) => Array.isArray(key) && key[0] === userMemoryKeys.activities.root);

  /**
   * Wipe the activity list for "delete all memories". For the active scope: the
   * in-memory view and every persisted query variant, dropping reads started
   * before the wipe. Pass the scope the purge started in: if the user switched
   * account/workspace meanwhile, only that scope's persisted rows are dropped
   * and the view on screen (another scope's) is left alone. The caller
   * (`purgeAllMemories`) revalidates afterwards.
   */
  internal_clearActivityList = async (scope: string = cacheScope.get()): Promise<boolean> => {
    if (scope === cacheScope.get()) return this.#list.clear();
    // Off-scope: schedules the delete of every persisted query variant there.
    return this.#list.remove(ACTIVITY_LIST_KEY, scope);
  };

  /**
   * Confirmed patch of one activity in the loaded view and in persisted rows
   * of query variants that are not loaded, so an edit survives a reload even
   * when no mounted list revalidates afterwards.
   */
  internal_updateActivityEntity = (
    id: string,
    fn: (item: ActivityListItem) => ActivityListItem,
  ): void => {
    this.#list.updateEntity<ActivityListItem>(id, fn);
  };

  deleteActivity = async (id: string): Promise<void> => {
    // Paging waits for the whole delete (see `#loadMore`): a page fetched while
    // the server shifts its offsets would skip a row.
    const pending = this.#deleteAndRefreshHead(id);
    this.#headRefresh = pending;
    try {
      await pending;
    } finally {
      if (this.#headRefresh === pending) this.#headRefresh = undefined;
    }
  };

  #deleteAndRefreshHead = async (id: string): Promise<void> => {
    await memoryCRUDService.deleteActivity(id);
    this.#headStale = true;
    // Drop the row from every loaded/persisted list, including reads in flight.
    this.#list.removeEntity(id);
    // The list is offset-paged: once a row is gone the server shifts the rows
    // after it one slot up, so the loaded next-page offset would skip one.
    // Collapse to the head page and revalidate it before paging again.
    this.#list.collapse(ACTIVITY_LIST_KEY);
    await this.#revalidateList();
  };

  /**
   * Next page, once the head is trustworthy. After a delete the loaded offset
   * is only valid when a fresh head page has landed; if that refresh failed,
   * retry it first and page only once it succeeds.
   */
  #loadMore = async (): Promise<void> => {
    if (this.#headRefresh) await this.#headRefresh.catch(() => undefined);
    if (this.#headStale) {
      await this.#revalidateList();
      if (this.#headStale) return;
    }
    await this.#list.loadMore(ACTIVITY_LIST_KEY);
  };

  /**
   * Append the next page of the activity list. The engine reads the loaded head
   * params, dedupes by id and keeps `hasMore` honest.
   */
  loadMoreActivities = (): void => {
    void this.#loadMore();
  };

  /**
   * Drop the painted page set for a new search/sort so the previous query's rows
   * never show under the new one. A no-op when the query is unchanged, so a
   * remount keeps the in-memory + persisted view (the replica's first-frame
   * paint). The persisted rows are left alone.
   */
  resetActivitiesList = (params?: Omit<ActivityQueryParams, 'page' | 'pageSize'>): void => {
    const { activitiesQuery, activitiesSort } = this.#get();
    const nextQuery = params?.q;
    const nextSort = params?.sort;
    if (activitiesQuery === nextQuery && activitiesSort === nextSort) return;

    this.#set(
      {
        activitiesQuery: nextQuery,
        activitiesSearchError: undefined,
        activitiesSearchLoading: true,
        activitiesSort: nextSort,
      },
      false,
      n('resetActivitiesList'),
    );
    this.#list.update(ACTIVITY_LIST_KEY, () => undefined, { persist: false });
  };

  /**
   * Fetch orchestration for the memory activity list. Returns an
   * `SWRResponse`-shaped result — `data` reads the replica view — so the
   * existing consumers (which pass it to `MemoryListBoundary`) are untouched;
   * the rows land in the store mirrors, never in this return value.
   */
  useFetchActivities = (params: ActivityQueryParams): SWRResponse<ActivityListResult> => {
    const sync = this.#list.useSync(
      {
        pageSize: params.pageSize ?? ACTIVITY_LIST_PAGE_SIZE,
        q: params.q,
        sort: params.sort,
        status: params.status,
        types: params.types,
      },
      {
        onError: (error) => this.#surfaceListError(error),
        onSuccess: () => {
          // A landed head page makes the paging offset trustworthy again.
          this.#headStale = false;
          this.#clearListError();
        },
      },
    );

    const view = useUserMemoryStore((state) => state.activityListData);
    const data = useMemo<ActivityListResult | undefined>(
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
      // A failed "load more" is the list's error too (the head error wins).
      error: sync.error ?? view?.loadMoreError,
      // Later pages report loading so the grid / timeline footer shows it; the
      // boundary keeps settled rows mounted while a page loads.
      isLoading: (!data && (sync.isValidating || !sync.isHydrated)) || Boolean(view?.isLoadingMore),
      isValidating: sync.isValidating,
      mutate: sync.revalidate,
    } as unknown as SWRResponse<ActivityListResult>;
  };
}

export type ActivityAction = Pick<ActivityActionImpl, keyof ActivityActionImpl>;
