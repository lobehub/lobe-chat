/**
 * @vitest-environment happy-dom
 *
 * The user-memory preference list is a `@lobechat/replica` paged resource: the
 * persisted head page paints before the network answers, the response confirms
 * and persists it, "load more" appends through the engine, a query change
 * repaints from its own head page instead of appending to the previous search,
 * and a delete drops the row from the view and the persisted projection.
 */
import { randomUUID } from 'node:crypto';

import { type UserMemoryItemSimple } from '@lobechat/types';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement, useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type DisplayPreferenceMemory } from '@/database/repositories/userMemory';
import { cacheScope, REPLICA_INDEX_KEY } from '@/libs/replica';
import { setScopedMutate } from '@/libs/swr/mutate';
import { memoryCRUDService, userMemoryService } from '@/services/userMemory';
import { LayersEnum } from '@/types/userMemory';

import { initialState } from '../../initialState';
import { useUserMemoryStore } from '../../store';
import { MAX_RECENT_PREFERENCE_QUERIES } from './action';
import {
  type PreferenceListData,
  preferenceListKey,
  type PreferenceListParams,
  preferenceListResource,
} from './projection';

const BASE_PARAMS: PreferenceListParams = { pageSize: 12 };
const SEARCH_PARAMS: PreferenceListParams = { pageSize: 12, q: 'foo' };
const SORT_PARAMS: PreferenceListParams = { pageSize: 12, sort: 'scorePriority' };
const BASE_KEY = preferenceListResource.storageKey(BASE_PARAMS);
const SEARCH_KEY = preferenceListResource.storageKey(SEARCH_PARAMS);
const SORT_KEY = preferenceListResource.storageKey(SORT_PARAMS);

/** One raw query-memory row, before the slice flattens it for display. */
const rawItem = (id: string) =>
  ({ memory: { id, title: id }, preference: {} }) as unknown as UserMemoryItemSimple;

const item = (id: string): DisplayPreferenceMemory =>
  ({ id, title: id }) as DisplayPreferenceMemory;

const ids = (data?: PreferenceListData) => data?.items.map((entry) => entry.id);

const rawItemsOf = (length: number, offset = 0) =>
  Array.from({ length }, (_, i) => rawItem(`preference-${i + offset}`));

const listPage = (items: UserMemoryItemSimple[], total: number) => ({
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

describe('preferenceList replica', () => {
  const scopes = new Set<string>();
  let scope = '';
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  const useScope = (next: string) => {
    scope = next;
    scopes.add(next);
    vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);
  };

  beforeEach(() => {
    useScope(`preference-user-${randomUUID()}:personal`);
    fetchSpy = vi.spyOn(userMemoryService, 'queryMemories');
    act(() => useUserMemoryStore.setState(initialState, false));
  });

  afterEach(async () => {
    cleanup();
    await Promise.all(
      [...scopes].flatMap((value) =>
        [BASE_KEY, SEARCH_KEY, SORT_KEY].map((queryKey) =>
          preferenceListResource.storage!.remove({ queryKey, scope: value }),
        ),
      ),
    );
    scopes.clear();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('keeps one entry per search / sort', () => {
    expect(preferenceListKey({})).toBe(preferenceListKey({ q: '' }));
    expect(preferenceListKey({ q: 'foo' })).not.toBe(preferenceListKey({}));
    expect(preferenceListKey({ sort: 'scorePriority' })).not.toBe(preferenceListKey({}));
  });

  it('paints the persisted head page before the network answers', async () => {
    const cached: PreferenceListData = {
      currentPage: 0,
      hasMore: true,
      items: [item('cached-1')],
      pageSize: 12,
      total: 24,
    };
    await preferenceListResource.storage!.set(
      { queryKey: BASE_KEY, scope },
      { data: cached, updatedAt: 1 },
    );
    fetchSpy.mockImplementation(pending);

    renderHook(() => useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['cached-1']),
    );
    // The flat mirror paints the persisted rows too.
    expect(useUserMemoryStore.getState().preferences.map((p) => p.id)).toEqual(['cached-1']);
    expect(useUserMemoryStore.getState().preferencesInit).toBe(true);
  });

  it('replaces the head page with the server response and persists it', async () => {
    fetchSpy.mockResolvedValue(listPage([rawItem('a'), rawItem('b')], 24));

    renderHook(() => useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a', 'b']),
    );
    expect(useUserMemoryStore.getState().preferences.map((p) => p.id)).toEqual(['a', 'b']);
    expect(useUserMemoryStore.getState().preferencesTotal).toBe(24);
    expect(useUserMemoryStore.getState().preferencesHasMore).toBe(true);
    // The nested `{ memory, preference }` row is flattened for display, and the
    // fetch is scoped to the preference layer.
    expect(useUserMemoryStore.getState().preferences[0]).toMatchObject({ id: 'a', title: 'a' });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ layer: LayersEnum.Preference }),
    );

    await waitFor(async () => {
      const row = await preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope });
      expect(ids(row?.data as PreferenceListData)).toEqual(['a', 'b']);
    });
  });

  it('appends the next page with the loaded query params', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage(rawItemsOf(12), 24))
      .mockResolvedValueOnce(listPage(rawItemsOf(12, 12), 24));

    const hook = renderHook(
      () => ({
        loadMore: useUserMemoryStore((s) => s.loadMorePreferences),
        sync: useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }),
      }),
      { wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(12));

    await act(async () => {
      hook.result.current.loadMore();
    });

    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(24));
    const list = useUserMemoryStore.getState().preferenceListData!;
    expect(list.currentPage).toBe(1);
    expect(list.items[12].id).toBe('preference-12');
    expect(list.hasMore).toBe(false);
    // The replica owns the cursor: page 2 of the loaded query.
    expect(fetchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, pageSize: 12 }));
  });

  it('repaints from its own head page when the query changes', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage(rawItemsOf(12), 24))
      .mockResolvedValueOnce(listPage(rawItemsOf(12, 12), 24))
      .mockResolvedValueOnce(listPage([rawItem('foo-1')], 1));

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(12));
    act(() => {
      useUserMemoryStore.getState().loadMorePreferences();
    });
    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(24));

    hook.rerender({ q: 'foo' });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['foo-1']),
    );
    // A different query resets the loaded depth; it never merges into the previous search.
    expect(useUserMemoryStore.getState().preferenceListData).toMatchObject({
      currentPage: 0,
      q: 'foo',
      total: 1,
    });
  });

  it('treats a sort change as a new page set', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage([rawItem('captured-1')], 2))
      .mockResolvedValueOnce(listPage([rawItem('priority-1')], 2));

    const hook = renderHook(
      (props: { sort?: PreferenceListParams['sort'] }) =>
        useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12, sort: props.sort }),
      { initialProps: {} as { sort?: PreferenceListParams['sort'] }, wrapper },
    );

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['captured-1']),
    );

    hook.rerender({ sort: 'scorePriority' });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['priority-1']),
    );
    expect(useUserMemoryStore.getState().preferenceListData).toMatchObject({
      currentPage: 0,
      sort: 'scorePriority',
    });
    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: 'scorePriority', layer: LayersEnum.Preference }),
    );
  });

  it('keeps the newest query when a superseded search resolves last', async () => {
    const pendingByQuery = new Map<string, (value: ReturnType<typeof listPage>) => void>();
    fetchSpy.mockImplementation(
      (params: { q?: string } = {}) =>
        new Promise((resolve) => pendingByQuery.set(params.q ?? '', resolve)),
    );

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );

    hook.rerender({ q: 'foo' });
    await waitFor(() => expect(pendingByQuery.has('foo')).toBe(true));

    await act(async () => {
      pendingByQuery.get('foo')!(listPage([rawItem('foo-1')], 1));
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['foo-1']),
    );

    // The superseded head request settles late and must not repaint the view.
    await act(async () => {
      pendingByQuery.get('')!(listPage(rawItemsOf(12), 24));
    });

    expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['foo-1']);
  });

  it('hides the previous query on a query switch but keeps its page set and persisted row', async () => {
    fetchSpy.mockResolvedValue(listPage([rawItem('a')], 1));

    renderHook(() => useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a']),
    );
    await waitFor(async () =>
      expect(
        (await preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope }))?.data,
      ).toBeDefined(),
    );

    act(() => useUserMemoryStore.getState().resetPreferencesList({ q: 'gone' }));

    expect(useUserMemoryStore.getState().preferenceListData).toBeUndefined();
    expect(useUserMemoryStore.getState().preferences).toEqual([]);
    expect(useUserMemoryStore.getState().preferencesInit).toBe(false);
    // The previous query's page set stays loaded for a switch back.
    expect(ids(useUserMemoryStore.getState().preferenceListEntries[preferenceListKey({})])).toEqual(
      ['a'],
    );
    const row = await preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope });
    expect(ids(row?.data as PreferenceListData)).toEqual(['a']);
  });

  it('hydrates a previously persisted query when the list switches back to it', async () => {
    // A search that was persisted in an earlier session.
    await preferenceListResource.storage!.set(
      { queryKey: SEARCH_KEY, scope },
      {
        data: {
          currentPage: 0,
          hasMore: false,
          items: [item('cached-foo')],
          pageSize: 12,
          q: 'foo',
        },
        updatedAt: 1,
      },
    );
    fetchSpy.mockResolvedValueOnce(listPage([rawItem('a')], 1)).mockImplementation(pending);

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a']),
    );

    // The network for the search never answers: only storage can paint it.
    hook.rerender({ q: 'foo' });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['cached-foo']),
    );
    expect(useUserMemoryStore.getState().preferences.map((p) => p.id)).toEqual(['cached-foo']);
    expect(useUserMemoryStore.getState().preferencesInit).toBe(true);
  });

  it('repaints a query loaded earlier in the session when switching back to it', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage([rawItem('a')], 1))
      .mockResolvedValueOnce(listPage([rawItem('foo-1')], 1))
      .mockImplementation(pending);

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a']),
    );
    hook.rerender({ q: 'foo' });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['foo-1']),
    );

    // Back to the unfiltered list while its revalidation hangs.
    hook.rerender({});

    expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a']);
    expect(hook.result.current.data).toBeDefined();
  });

  it('does not surface a superseded search’s failure on the query now on screen', async () => {
    const rejectByQuery = new Map<string, (error: Error) => void>();
    fetchSpy.mockImplementation(
      (params: { q?: string } = {}) =>
        new Promise((_, reject) => rejectByQuery.set(params.q ?? '', reject)),
    );

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12, q: props.q }),
      { initialProps: { q: 'a' } as { q?: string }, wrapper },
    );
    await waitFor(() => expect(rejectByQuery.has('a')).toBe(true));

    hook.rerender({ q: 'b' });
    await waitFor(() => expect(rejectByQuery.has('b')).toBe(true));

    // Search A fails after search B started.
    await act(async () => {
      rejectByQuery.get('a')!(new Error('stale failure'));
    });

    expect(hook.result.current.error).toBeUndefined();
    expect(hook.result.current.isLoading).toBe(true);

    // B's own failure is surfaced.
    const failure = new Error('current failure');
    await act(async () => {
      rejectByQuery.get('b')!(failure);
    });
    await waitFor(() => expect(hook.result.current.error).toBe(failure));
  });

  it('keeps the painted rows when only their background revalidation fails', async () => {
    fetchSpy.mockResolvedValueOnce(listPage([rawItem('a')], 1));

    const hook = renderHook(
      () => useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }),
      { wrapper },
    );
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a']),
    );

    fetchSpy.mockRejectedValue(new Error('offline'));
    await act(async () => {
      await hook.result.current.mutate().catch(() => {});
    });

    expect(hook.result.current.error).toBeUndefined();
    expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a']);
  });

  it('applies an edit to the canonical page sets and their persisted rows', async () => {
    fetchSpy.mockResolvedValue(listPage([rawItem('a'), rawItem('b')], 2));

    renderHook(() => useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a', 'b']),
    );
    await waitFor(async () =>
      expect(
        (await preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope }))?.data,
      ).toBeDefined(),
    );

    act(() => {
      useUserMemoryStore.getState().internal_updatePreferenceEntity('a', (entry) => ({
        ...entry,
        conclusionDirectives: 'edited',
      }));
    });

    const state = useUserMemoryStore.getState();
    expect(state.preferenceListEntries[preferenceListKey({})].items[0].conclusionDirectives).toBe(
      'edited',
    );
    expect(state.preferenceListData?.items[0].conclusionDirectives).toBe('edited');
    expect(state.preferences[0].conclusionDirectives).toBe('edited');
    await waitFor(async () => {
      const row = await preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope });
      expect((row?.data as PreferenceListData).items[0].conclusionDirectives).toBe('edited');
    });
  });

  it('clears every persisted page set, not only the one on screen', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage([rawItem('a')], 1))
      .mockResolvedValueOnce(listPage([rawItem('foo-1')], 1));

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );
    await waitFor(async () =>
      expect(
        (await preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope }))?.data,
      ).toBeDefined(),
    );
    hook.rerender({ q: 'foo' });
    await waitFor(async () =>
      expect(
        (await preferenceListResource.storage!.get({ queryKey: SEARCH_KEY, scope }))?.data,
      ).toBeDefined(),
    );

    let cleared = false;
    await act(async () => {
      cleared = await useUserMemoryStore.getState().internal_clearPreferenceList();
    });

    expect(cleared).toBe(true);
    expect(useUserMemoryStore.getState().preferenceListEntries).toEqual({});
    expect(useUserMemoryStore.getState().preferences).toEqual([]);
    await expect(
      preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope }),
    ).resolves.toBeUndefined();
    await expect(
      preferenceListResource.storage!.get({ queryKey: SEARCH_KEY, scope }),
    ).resolves.toBeUndefined();
  });

  it('drops a deleted preference from the view and the persisted row', async () => {
    // The head is refetched after a delete, so the mock answers from a server
    // list that already lost the row.
    let server = [rawItem('a'), rawItem('b')];
    fetchSpy.mockImplementation(async () => listPage(server, server.length));
    vi.spyOn(memoryCRUDService, 'deletePreference').mockResolvedValue(undefined as never);

    renderHook(() => useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['a', 'b']),
    );

    server = [rawItem('b')];
    await act(async () => {
      await useUserMemoryStore.getState().deletePreference('a');
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(['b']),
    );
    expect(useUserMemoryStore.getState().preferences.map((p) => p.id)).toEqual(['b']);

    await waitFor(async () => {
      const row = await preferenceListResource.storage!.get({ queryKey: BASE_KEY, scope });
      expect(ids(row?.data as PreferenceListData)).toEqual(['b']);
    });
  });

  it('does not fetch another page when the head page is the last one', async () => {
    fetchSpy.mockResolvedValue(listPage([rawItem('only')], 1));

    renderHook(() => useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(1));
    expect(useUserMemoryStore.getState().preferencesHasMore).toBe(false);

    act(() => {
      useUserMemoryStore.getState().loadMorePreferences();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps offset pagination contiguous after deleting from a loaded page', async () => {
    // 30 rows; deleting r5 shifts every later row one position earlier, so an
    // unchanged next-page cursor would step over the row that slid into its
    // place and omit it from the list.
    let server = Array.from({ length: 30 }, (_, i) => rawItem(`r${i}`));
    fetchSpy.mockImplementation(
      async ({ page = 1, pageSize = 12 }: { page?: number; pageSize?: number } = {}) => {
        const start = (page - 1) * pageSize;
        return listPage(server.slice(start, start + pageSize), server.length);
      },
    );
    vi.spyOn(memoryCRUDService, 'deletePreference').mockResolvedValue(undefined as never);

    const hook = renderHook(
      () => ({
        loadMore: useUserMemoryStore((s) => s.loadMorePreferences),
        sync: useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }),
      }),
      { wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(12));
    await act(async () => {
      hook.result.current.loadMore();
    });
    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(24));

    server = [...server.slice(0, 5), ...server.slice(6)];
    await act(async () => {
      await useUserMemoryStore.getState().deletePreference('r5');
    });

    // The head was collapsed and refetched, so it paints 12 rows again.
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(
        server.slice(0, 12).map((raw) => raw.memory.id),
      ),
    );

    await act(async () => {
      hook.result.current.loadMore();
    });

    // Exactly the first 24 rows of the post-delete server list: no row skipped
    // at the page boundary, and none dropped by the stale offset.
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(
        server.slice(0, 24).map((raw) => raw.memory.id),
      ),
    );
  });

  it('refetches the head after deleting from it when only the head is loaded', async () => {
    // Only page 1 is loaded: without a head refetch the local head keeps 11
    // rows while the server's page 2 starts one row later, skipping r12.
    let server = Array.from({ length: 30 }, (_, i) => rawItem(`r${i}`));
    fetchSpy.mockImplementation(
      async ({ page = 1, pageSize = 12 }: { page?: number; pageSize?: number } = {}) => {
        const start = (page - 1) * pageSize;
        return listPage(server.slice(start, start + pageSize), server.length);
      },
    );
    vi.spyOn(memoryCRUDService, 'deletePreference').mockResolvedValue(undefined as never);

    const hook = renderHook(
      () => ({
        loadMore: useUserMemoryStore((s) => s.loadMorePreferences),
        sync: useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }),
      }),
      { wrapper },
    );
    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(12));

    server = [...server.slice(0, 5), ...server.slice(6)];
    await act(async () => {
      await useUserMemoryStore.getState().deletePreference('r5');
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(
        server.slice(0, 12).map((raw) => raw.memory.id),
      ),
    );

    await act(async () => {
      hook.result.current.loadMore();
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().preferenceListData)).toEqual(
        server.slice(0, 24).map((raw) => raw.memory.id),
      ),
    );
  });

  it('shows the list footer while the next page is loading', async () => {
    let resolvePage: ((value: ReturnType<typeof listPage>) => void) | undefined;
    fetchSpy
      .mockResolvedValueOnce(listPage(rawItemsOf(12), 24))
      .mockImplementationOnce(() => new Promise((resolve) => (resolvePage = resolve)));

    const hook = renderHook(
      () => ({
        loadMore: useUserMemoryStore((s) => s.loadMorePreferences),
        sync: useUserMemoryStore((s) => s.useFetchPreferences)({ pageSize: 12 }),
      }),
      { wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(12));
    expect(hook.result.current.sync.isLoading).toBe(false);

    act(() => {
      hook.result.current.loadMore();
    });

    // The rows stay mounted, but the footer is on while the page is in flight.
    await waitFor(() => expect(hook.result.current.sync.isLoading).toBe(true));
    expect(useUserMemoryStore.getState().preferences).toHaveLength(12);

    await act(async () => {
      resolvePage!(listPage(rawItemsOf(12, 12), 24));
    });
    await waitFor(() => expect(useUserMemoryStore.getState().preferences).toHaveLength(24));
    expect(hook.result.current.sync.isLoading).toBe(false);
  });

  it('bounds how many query page sets are kept', async () => {
    fetchSpy.mockImplementation(({ q }: { q?: string } = {}) =>
      Promise.resolve(listPage([rawItem(`${q}-hit`)], 1)),
    );

    const queries = Array.from({ length: MAX_RECENT_PREFERENCE_QUERIES + 2 }, (_, i) => `q-${i}`);
    const params = (q: string) => ({ pageSize: 12, q });
    const entry = (q: string) =>
      useUserMemoryStore.getState().preferenceListEntries[preferenceListKey(params(q))];

    const hook = renderHook(
      (props: { q: string }) => useUserMemoryStore((s) => s.useFetchPreferences)(params(props.q)),
      { initialProps: { q: queries[0] }, wrapper },
    );

    for (const q of queries.slice(1)) {
      hook.rerender({ q });
      await waitFor(() => expect(entry(q)).toBeDefined());
    }

    expect(Object.keys(useUserMemoryStore.getState().preferenceListEntries)).toHaveLength(
      MAX_RECENT_PREFERENCE_QUERIES,
    );
    // The first keyword fell out of the bounded recent-query window.
    expect(entry(queries[0])).toBeUndefined();
    expect(entry(queries.at(-1)!)).toBeDefined();
  });

  it('bounds the window across reloads, from the queries an earlier session persisted', async () => {
    // Emulate a page that persisted MORE queries than the window before this
    // store instance existed: the rows, plus the engine's index of them. The
    // in-memory recency list alone cannot see these, so without seeding it the
    // window would start empty and persist another cap on top of them.
    const previous = Array.from(
      { length: MAX_RECENT_PREFERENCE_QUERIES + 2 },
      (_, i) => `old-${i}`,
    );
    const paramsOf = (q: string): PreferenceListParams => ({ pageSize: 12, q });
    for (const q of previous) {
      await preferenceListResource.storage!.set(
        { queryKey: preferenceListResource.storageKey(paramsOf(q)), scope },
        {
          data: {
            currentPage: 0,
            hasMore: false,
            items: [item(`${q}-hit`)],
            pageSize: 12,
            total: 1,
          } satisfies PreferenceListData,
          updatedAt: 1,
        },
      );
    }
    // The engine's index holds the storage keys it persisted; with no replica
    // `query`, those are the entry keys themselves.
    await preferenceListResource.storage!.set(
      { queryKey: REPLICA_INDEX_KEY, scope },
      { data: previous.map((q) => preferenceListResource.storageKey(paramsOf(q))), updatedAt: 1 },
    );

    const remove = vi.spyOn(preferenceListResource.storage!, 'remove');
    fetchSpy.mockImplementation(({ q }: { q?: string } = {}) =>
      Promise.resolve(listPage([rawItem(`${q}-hit`)], 1)),
    );

    renderHook(() => useUserMemoryStore((s) => s.useFetchPreferences)(paramsOf('fresh')), {
      wrapper,
    });

    // Seeding put the persisted queries ahead of this session's own entry, so
    // eviction reached the oldest of THEM — the bound now spans sessions.
    const evicted = (q: string) => preferenceListResource.storageKey(paramsOf(q));
    await waitFor(() =>
      expect(remove.mock.calls.map(([key]) => key.queryKey)).toEqual(
        previous.slice(0, previous.length - MAX_RECENT_PREFERENCE_QUERIES + 1).map(evicted),
      ),
    );
    expect(remove).not.toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: evicted('fresh') }),
    );

    // The evicted keys must leave the persisted index too: they were never
    // written by this instance, and a leftover entry would survive every reload.
    await waitFor(async () => {
      const index = await preferenceListResource.storage!.get({
        queryKey: REPLICA_INDEX_KEY,
        scope,
      });
      const stored = (index?.data as unknown as string[] | undefined) ?? [];
      expect(stored).toHaveLength(MAX_RECENT_PREFERENCE_QUERIES);
      for (const q of previous.slice(0, previous.length - MAX_RECENT_PREFERENCE_QUERIES + 1)) {
        expect(stored).not.toContain(evicted(q));
      }
    });
  });
});
