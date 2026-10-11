/**
 * @vitest-environment happy-dom
 *
 * The user-memory activity list is a `@lobechat/replica` paged resource: the
 * persisted head page paints before the network answers, the response confirms
 * and persists it, "load more" appends through the engine, a query change
 * repaints from its own head page instead of appending to the previous search,
 * and a delete drops the row from the view and the persisted projection.
 */
import { randomUUID } from 'node:crypto';

import { type ActivityListItem, type ActivityListResult } from '@lobechat/types';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement, useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheScope } from '@/libs/replica';
import { setScopedMutate } from '@/libs/swr/mutate';
import { memoryCRUDService, userMemoryService } from '@/services/userMemory';
import { LayersEnum } from '@/types/userMemory';

import { initialState } from '../../initialState';
import { useUserMemoryStore } from '../../store';
import { identityScopeOf } from '../../utils/replica';
import {
  ACTIVITY_LIST_KEY,
  type ActivityListData,
  type ActivityListParams,
  activityListResource,
} from './projection';

const BASE_PARAMS: ActivityListParams = { pageSize: 12 };
const SEARCH_PARAMS: ActivityListParams = { pageSize: 12, q: 'foo' };
const BASE_KEY = activityListResource.storageKey(BASE_PARAMS);
const SEARCH_KEY = activityListResource.storageKey(SEARCH_PARAMS);

const item = (id: string): ActivityListItem => ({ id, title: id }) as ActivityListItem;

const ids = (data?: ActivityListData) => data?.items.map((entry) => entry.id);

const idsOf = (length: number, offset = 0) =>
  Array.from({ length }, (_, i) => item(`activity-${i + offset}`));

const listPage = (items: ActivityListItem[], total: number): ActivityListResult => ({
  items,
  page: 1,
  pageSize: 12,
  total,
});

/** Never-resolving fetch: the first frame can only come from storage. */
const pending = () => new Promise<never>(() => {});

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

describe('activityList replica', () => {
  const scopes = new Set<string>();
  let scope = '';
  /** Storage partition of userMemory replicas: the user, not the workspace. */
  let rowScope = '';
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  const useScope = (next: string) => {
    scope = next;
    rowScope = identityScopeOf(scope);
    scopes.add(rowScope);
    vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);
  };

  beforeEach(() => {
    useScope(`activity-user-${randomUUID()}:personal`);
    fetchSpy = vi.spyOn(userMemoryService, 'queryActivities');
    act(() => useUserMemoryStore.setState(initialState, false));
  });

  afterEach(async () => {
    cleanup();
    await Promise.all(
      [...scopes].flatMap((value) =>
        [BASE_KEY, SEARCH_KEY].map((queryKey) =>
          activityListResource.storage!.remove({ queryKey, scope: value }),
        ),
      ),
    );
    scopes.clear();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  /** A server list the fetch spy pages through by offset, like `queryActivities`. */
  const serveList = (rows: ActivityListItem[]) =>
    fetchSpy.mockImplementation(async (params: { page?: number; pageSize?: number } = {}) => {
      const pageSize = params.pageSize ?? 12;
      const start = ((params.page ?? 1) - 1) * pageSize;
      return {
        items: rows.slice(start, start + pageSize),
        page: params.page ?? 1,
        pageSize,
        total: rows.length,
      };
    });

  it('reads the list from a single scope entry', () => {
    expect(ACTIVITY_LIST_KEY).toBe('all');
  });

  it('paints the persisted head page before the network answers', async () => {
    const cached: ActivityListData = {
      currentPage: 0,
      hasMore: true,
      items: [item('cached-1')],
      pageSize: 12,
      total: 24,
    };
    await activityListResource.storage!.set(
      { queryKey: BASE_KEY, scope: rowScope },
      { data: cached, updatedAt: 1 },
    );
    fetchSpy.mockImplementation(pending);

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['cached-1']),
    );
    // The flat mirror paints the persisted rows too.
    expect(useUserMemoryStore.getState().activities.map((a) => a.id)).toEqual(['cached-1']);
    expect(useUserMemoryStore.getState().activitiesInit).toBe(true);
  });

  it('replaces the head page with the server response and persists it', async () => {
    fetchSpy.mockResolvedValue(listPage([item('a'), item('b')], 24));

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['a', 'b']),
    );
    expect(useUserMemoryStore.getState().activities.map((a) => a.id)).toEqual(['a', 'b']);
    expect(useUserMemoryStore.getState().activitiesTotal).toBe(24);
    expect(useUserMemoryStore.getState().activitiesHasMore).toBe(true);

    await waitFor(async () => {
      const row = await activityListResource.storage!.get({ queryKey: BASE_KEY, scope: rowScope });
      expect(ids(row?.data as ActivityListData)).toEqual(['a', 'b']);
    });
  });

  it('appends the next page with the loaded query params', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage(idsOf(12), 24))
      .mockResolvedValueOnce(listPage(idsOf(12, 12), 24));

    const hook = renderHook(
      () => ({
        loadMore: useUserMemoryStore((s) => s.loadMoreActivities),
        sync: useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }),
      }),
      { wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(12));

    await act(async () => {
      hook.result.current.loadMore();
    });

    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(24));
    const list = useUserMemoryStore.getState().activityListData!;
    expect(list.currentPage).toBe(1);
    expect(list.items[12].id).toBe('activity-12');
    expect(list.hasMore).toBe(false);
    // The replica owns the cursor: page 2 of the loaded query.
    expect(fetchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, pageSize: 12 }));
  });

  it('repaints from its own head page when the query changes', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage(idsOf(12), 24))
      .mockResolvedValueOnce(listPage(idsOf(12, 12), 24))
      .mockResolvedValueOnce(listPage([item('foo-1')], 1));

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(12));
    act(() => {
      useUserMemoryStore.getState().loadMoreActivities();
    });
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(24));

    hook.rerender({ q: 'foo' });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['foo-1']),
    );
    // A different query resets the loaded depth; it never merges into the previous search.
    expect(useUserMemoryStore.getState().activityListData).toMatchObject({
      currentPage: 0,
      q: 'foo',
      total: 1,
    });
  });

  it('keeps the newest query when a superseded search resolves last', async () => {
    const pendingByQuery = new Map<string, (value: ActivityListResult) => void>();
    fetchSpy.mockImplementation(
      (params: { q?: string } = {}) =>
        new Promise<ActivityListResult>((resolve) => pendingByQuery.set(params.q ?? '', resolve)),
    );

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );

    hook.rerender({ q: 'foo' });
    await waitFor(() => expect(pendingByQuery.has('foo')).toBe(true));

    await act(async () => {
      pendingByQuery.get('foo')!(listPage([item('foo-1')], 1));
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['foo-1']),
    );

    // The superseded head request settles late and must not repaint the view.
    await act(async () => {
      pendingByQuery.get('')!(listPage(idsOf(12), 24));
    });

    expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['foo-1']);
  });

  it('drops the painted page set on reset but keeps the persisted row', async () => {
    fetchSpy.mockResolvedValue(listPage([item('a')], 1));

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() => expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['a']));
    await waitFor(async () =>
      expect(
        (await activityListResource.storage!.get({ queryKey: BASE_KEY, scope: rowScope }))?.data,
      ).toBeDefined(),
    );

    act(() => useUserMemoryStore.getState().resetActivitiesList({ q: 'gone' }));

    expect(useUserMemoryStore.getState().activityListData).toBeUndefined();
    expect(useUserMemoryStore.getState().activities).toEqual([]);
    expect(useUserMemoryStore.getState().activitiesSearchLoading).toBe(true);
    const row = await activityListResource.storage!.get({ queryKey: BASE_KEY, scope: rowScope });
    expect(ids(row?.data as ActivityListData)).toEqual(['a']);
  });

  it('drops a deleted activity from the view and the persisted row', async () => {
    const server = [item('a'), item('b')];
    serveList(server);
    vi.spyOn(memoryCRUDService, 'deleteActivity').mockImplementation(async (id: string) => {
      server.splice(
        server.findIndex((row) => row.id === id),
        1,
      );
      return undefined as never;
    });

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['a', 'b']),
    );

    await act(async () => {
      await useUserMemoryStore.getState().deleteActivity('a');
    });

    await waitFor(() => expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['b']));
    expect(useUserMemoryStore.getState().activities.map((a) => a.id)).toEqual(['b']);

    await waitFor(async () => {
      const row = await activityListResource.storage!.get({ queryKey: BASE_KEY, scope: rowScope });
      expect(ids(row?.data as ActivityListData)).toEqual(['b']);
    });
  });

  it('does not skip the row that shifts onto the head after a delete', async () => {
    const server = idsOf(36);
    serveList(server);
    vi.spyOn(memoryCRUDService, 'deleteActivity').mockImplementation(async (id: string) => {
      server.splice(
        server.findIndex((row) => row.id === id),
        1,
      );
      return undefined as never;
    });

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(12));
    act(() => useUserMemoryStore.getState().loadMoreActivities());
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(24));

    await act(async () => {
      await useUserMemoryStore.getState().deleteActivity('activity-0');
    });

    // The loaded depth collapses to the revalidated head page.
    const head = useUserMemoryStore.getState().activityListData!;
    expect(head.currentPage).toBe(0);
    expect(ids(head)).toEqual(idsOf(12, 1).map((row) => row.id));

    act(() => useUserMemoryStore.getState().loadMoreActivities());
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(24));
    act(() => useUserMemoryStore.getState().loadMoreActivities());
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(35));

    // Every remaining server row is listed exactly once, in order.
    expect(useUserMemoryStore.getState().activities.map((a) => a.id)).toEqual(
      idsOf(35, 1).map((row) => row.id),
    );
  });

  it('waits for the post-delete head revalidation before loading more', async () => {
    const server = idsOf(36);
    serveList(server);
    vi.spyOn(memoryCRUDService, 'deleteActivity').mockImplementation(async (id: string) => {
      server.splice(
        server.findIndex((row) => row.id === id),
        1,
      );
      return undefined as never;
    });

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(12));

    let deleted!: Promise<void>;
    act(() => {
      deleted = useUserMemoryStore.getState().deleteActivity('activity-3');
      // Paging while the head is still being revalidated.
      useUserMemoryStore.getState().loadMoreActivities();
    });
    await act(async () => {
      await deleted;
    });
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(24));

    expect(useUserMemoryStore.getState().activities.map((a) => a.id)).toEqual(
      server.slice(0, 24).map((row) => row.id),
    );
  });

  it('reports a page being loaded and a failed page through the compatibility response', async () => {
    let failPage!: (error: Error) => void;
    fetchSpy
      .mockResolvedValueOnce(listPage(idsOf(12), 24))
      .mockImplementationOnce(() => new Promise<never>((_, reject) => (failPage = reject)));

    const hook = renderHook(
      () => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }),
      { wrapper },
    );
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(12));
    expect(hook.result.current.isLoading).toBe(false);

    act(() => useUserMemoryStore.getState().loadMoreActivities());
    await waitFor(() => expect(hook.result.current.isLoading).toBe(true));
    expect(hook.result.current.data?.items).toHaveLength(12);

    const error = new Error('page 2 failed');
    await act(async () => failPage(error));

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    expect(hook.result.current.error).toBe(error);
    // A failed later page never replaces the settled list with an error.
    expect(useUserMemoryStore.getState().activitiesSearchError).toBeUndefined();
    expect(useUserMemoryStore.getState().activities).toHaveLength(12);
  });

  it('ignores a late failure of a superseded query', async () => {
    const rejectByQuery = new Map<string, (error: Error) => void>();
    fetchSpy.mockImplementation(
      (params: { q?: string } = {}) =>
        new Promise<ActivityListResult>((_, reject) => rejectByQuery.set(params.q ?? '', reject)),
    );

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );
    await waitFor(() => expect(rejectByQuery.has('')).toBe(true));

    act(() => useUserMemoryStore.getState().resetActivitiesList({ q: 'foo' }));
    hook.rerender({ q: 'foo' });
    await waitFor(() => expect(rejectByQuery.has('foo')).toBe(true));

    await act(async () => {
      rejectByQuery.get('')!(new Error('superseded'));
    });

    // The new query is still resetting and shows no error of the old one.
    expect(useUserMemoryStore.getState().activitiesSearchError).toBeUndefined();
    expect(useUserMemoryStore.getState().activitiesSearchLoading).toBe(true);
  });

  it('drops the previous scope error when the account or workspace scope changes', async () => {
    // The next identity's request stays in flight the whole time.
    fetchSpy.mockImplementation(pending);
    // The first identity's initial request fails, so its error is on screen.
    fetchSpy.mockRejectedValueOnce(new Error('previous scope failed'));

    const hook = renderHook(
      () => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }),
      { wrapper },
    );
    await waitFor(() =>
      expect(useUserMemoryStore.getState().activitiesSearchError).toBeInstanceOf(Error),
    );

    // Switch identity: only the scope reset can drop the previous error before
    // the new request settles (its own `onSuccess` never runs while pending).
    act(() => {
      scope = `activity-user-${randomUUID()}:personal`;
      rowScope = identityScopeOf(scope);
      scopes.add(rowScope);
    });
    hook.rerender();

    await waitFor(() =>
      expect(useUserMemoryStore.getState().activitiesSearchError).toBeUndefined(),
    );
    // The new identity starts empty instead of showing the previous one's rows.
    expect(useUserMemoryStore.getState().activities).toEqual([]);
    expect(useUserMemoryStore.getState().activityListData).toBeUndefined();
  });

  it('wipes every persisted query variant when all memories are purged', async () => {
    const server = [item('a'), item('b')];
    serveList(server);
    vi.spyOn(memoryCRUDService, 'deleteAll').mockImplementation(async () => {
      server.length = 0;
      return undefined as never;
    });

    // A search the user visited earlier leaves its own persisted row behind.
    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12, q: props.q }),
      { initialProps: { q: 'foo' } as { q?: string }, wrapper },
    );
    await waitFor(async () =>
      expect(
        (await activityListResource.storage!.get({ queryKey: SEARCH_KEY, scope: rowScope }))?.data,
      ).toBeDefined(),
    );
    hook.rerender({});
    await waitFor(async () =>
      expect(
        (await activityListResource.storage!.get({ queryKey: BASE_KEY, scope: rowScope }))?.data,
      ).toBeDefined(),
    );
    expect(ids(useUserMemoryStore.getState().activityListData)).toEqual(['a', 'b']);

    await act(async () => {
      await useUserMemoryStore.getState().purgeAllMemories();
    });

    // The inactive search's row is gone too: a reload on it cannot paint deleted memories.
    expect(
      await activityListResource.storage!.get({ queryKey: SEARCH_KEY, scope: rowScope }),
    ).toBeFalsy();
    // The mounted query revalidates against the emptied server.
    await waitFor(() => expect(ids(useUserMemoryStore.getState().activityListData)).toEqual([]));
    expect(useUserMemoryStore.getState().activities).toEqual([]);
  });

  it('patches an edited activity in the view and in persisted query variants', async () => {
    const server = idsOf(2);
    serveList(server);
    // The server holds the edit too, so the head revalidation confirms it.
    vi.spyOn(memoryCRUDService, 'updateActivity').mockImplementation(
      async (id: string, data: object) => {
        Object.assign(
          server.find((row) => row.id === id)!,
          data,
        );
        return undefined as never;
      },
    );

    // A search the user visited earlier keeps its own persisted row.
    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12, q: props.q }),
      { initialProps: { q: 'foo' } as { q?: string }, wrapper },
    );
    await waitFor(async () =>
      expect(
        (await activityListResource.storage!.get({ queryKey: SEARCH_KEY, scope: rowScope }))?.data,
      ).toBeDefined(),
    );
    hook.rerender({});
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(2));

    await act(async () => {
      await useUserMemoryStore.getState().updateMemory('activity-0', 'edited', LayersEnum.Activity);
    });

    const edited = (data?: ActivityListData) =>
      data?.items.find((entry) => entry.id === 'activity-0') as Record<string, unknown> | undefined;
    // The canonical view (not only the flat mirror) carries the edit.
    expect(edited(useUserMemoryStore.getState().activityListData)?.narrative).toBe('edited');
    // The unloaded search variant is patched too, so a reload on it shows the edit.
    await waitFor(async () => {
      const row = await activityListResource.storage!.get({
        queryKey: SEARCH_KEY,
        scope: rowScope,
      });
      expect(edited(row?.data as ActivityListData)?.narrative).toBe('edited');
    });
  });

  it('keeps paging blocked until a head page lands after a failed post-delete refresh', async () => {
    const server = idsOf(24);
    let failHead = false;
    fetchSpy.mockImplementation(async (params: { page?: number; pageSize?: number } = {}) => {
      const page = params.page ?? 1;
      if (page === 1 && failHead) {
        failHead = false;
        throw new Error('head refresh failed');
      }
      const start = (page - 1) * 12;
      return { items: server.slice(start, start + 12), page, pageSize: 12, total: server.length };
    });
    vi.spyOn(memoryCRUDService, 'deleteActivity').mockImplementation(async (id: string) => {
      server.splice(
        server.findIndex((row) => row.id === id),
        1,
      );
      failHead = true;
      return undefined as never;
    });

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(12));

    await act(async () => {
      await useUserMemoryStore.getState().deleteActivity('activity-0');
    });
    // The refresh failed: the head still holds 11 rows, so offset 12 would skip one.
    expect(useUserMemoryStore.getState().activities).toHaveLength(11);

    act(() => useUserMemoryStore.getState().loadMoreActivities());
    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(23));

    expect(useUserMemoryStore.getState().activities.map((row) => row.id)).toEqual(
      server.map((row) => row.id),
    );
  });

  it('does not fetch another page when the head page is the last one', async () => {
    fetchSpy.mockResolvedValue(listPage([item('only')], 1));

    renderHook(() => useUserMemoryStore((s) => s.useFetchActivities)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() => expect(useUserMemoryStore.getState().activities).toHaveLength(1));
    expect(useUserMemoryStore.getState().activitiesHasMore).toBe(false);

    act(() => {
      useUserMemoryStore.getState().loadMoreActivities();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
