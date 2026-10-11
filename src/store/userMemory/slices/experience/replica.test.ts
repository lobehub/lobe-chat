/**
 * @vitest-environment happy-dom
 *
 * The user-memory experience list is a `@lobechat/replica` paged resource: the
 * persisted head page paints before the network answers, the response confirms
 * and persists it, "load more" appends through the engine, a query change
 * repaints from its own head page instead of appending to the previous search,
 * and a delete drops the row from the view and the persisted projection.
 */
import { randomUUID } from 'node:crypto';

import { type ExperienceListItem, type ExperienceListResult } from '@lobechat/types';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { createElement, useEffect } from 'react';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheScope, REPLICA_INDEX_KEY } from '@/libs/replica';
import { setScopedMutate } from '@/libs/swr/mutate';
import { memoryCRUDService, userMemoryService } from '@/services/userMemory';
import { LayersEnum } from '@/types/userMemory';

import { initialState } from '../../initialState';
import { useUserMemoryStore } from '../../store';
import {
  EXPERIENCE_LIST_KEY,
  type ExperienceListData,
  type ExperienceListParams,
  experienceListResource,
} from './projection';

const BASE_PARAMS: ExperienceListParams = { pageSize: 12 };
const SEARCH_PARAMS: ExperienceListParams = { pageSize: 12, q: 'foo' };
const BASE_KEY = experienceListResource.storageKey(BASE_PARAMS);
const SEARCH_KEY = experienceListResource.storageKey(SEARCH_PARAMS);

const item = (id: string): ExperienceListItem => ({ id, title: id }) as ExperienceListItem;

const ids = (data?: ExperienceListData) => data?.items.map((entry) => entry.id);

const idsOf = (length: number, offset = 0) =>
  Array.from({ length }, (_, i) => item(`experience-${i + offset}`));

const listPage = (items: ExperienceListItem[], total: number): ExperienceListResult => ({
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

describe('experienceList replica', () => {
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
    useScope(`experience-user-${randomUUID()}:personal`);
    fetchSpy = vi.spyOn(userMemoryService, 'queryExperiences');
    act(() => useUserMemoryStore.setState(initialState, false));
  });

  afterEach(async () => {
    cleanup();
    await Promise.all(
      [...scopes].flatMap((value) =>
        [BASE_KEY, SEARCH_KEY, REPLICA_INDEX_KEY].map((queryKey) =>
          experienceListResource.storage!.remove({ queryKey, scope: value }),
        ),
      ),
    );
    scopes.clear();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  /** Persist a row for a query variant that is not loaded, indexed like the engine does. */
  const seedSearchRow = async (data: ExperienceListData) => {
    await experienceListResource.storage!.set(
      { queryKey: SEARCH_KEY, scope },
      { data, updatedAt: 1 },
    );
    await experienceListResource.storage!.set({ queryKey: REPLICA_INDEX_KEY, scope }, {
      data: [SEARCH_KEY],
      updatedAt: 1,
    } as never);
  };

  it('reads the list from a single scope entry', () => {
    expect(EXPERIENCE_LIST_KEY).toBe('all');
  });

  it('paints the persisted head page before the network answers', async () => {
    const cached: ExperienceListData = {
      currentPage: 0,
      hasMore: true,
      items: [item('cached-1')],
      pageSize: 12,
      total: 24,
    };
    await experienceListResource.storage!.set(
      { queryKey: BASE_KEY, scope },
      { data: cached, updatedAt: 1 },
    );
    fetchSpy.mockImplementation(pending);

    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['cached-1']),
    );
    // The flat mirror paints the persisted rows too.
    expect(useUserMemoryStore.getState().experiences.map((e) => e.id)).toEqual(['cached-1']);
    expect(useUserMemoryStore.getState().experiencesInit).toBe(true);
  });

  it('replaces the head page with the server response and persists it', async () => {
    fetchSpy.mockResolvedValue(listPage([item('a'), item('b')], 24));

    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['a', 'b']),
    );
    expect(useUserMemoryStore.getState().experiences.map((e) => e.id)).toEqual(['a', 'b']);
    expect(useUserMemoryStore.getState().experiencesTotal).toBe(24);
    expect(useUserMemoryStore.getState().experiencesHasMore).toBe(true);

    await waitFor(async () => {
      const row = await experienceListResource.storage!.get({ queryKey: BASE_KEY, scope });
      expect(ids(row?.data as ExperienceListData)).toEqual(['a', 'b']);
    });
  });

  it('appends the next page with the loaded query params', async () => {
    fetchSpy
      .mockResolvedValueOnce(listPage(idsOf(12), 24))
      .mockResolvedValueOnce(listPage(idsOf(12, 12), 24));

    const hook = renderHook(
      () => ({
        loadMore: useUserMemoryStore((s) => s.loadMoreExperiences),
        sync: useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }),
      }),
      { wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(12));

    await act(async () => {
      hook.result.current.loadMore();
    });

    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(24));
    const list = useUserMemoryStore.getState().experienceListData!;
    expect(list.currentPage).toBe(1);
    expect(list.items[12].id).toBe('experience-12');
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
        useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );

    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(12));
    act(() => {
      useUserMemoryStore.getState().loadMoreExperiences();
    });
    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(24));

    hook.rerender({ q: 'foo' });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['foo-1']),
    );
    // A different query resets the loaded depth; it never merges into the previous search.
    expect(useUserMemoryStore.getState().experienceListData).toMatchObject({
      currentPage: 0,
      q: 'foo',
      total: 1,
    });
  });

  it('keeps the newest query when a superseded search resolves last', async () => {
    const pendingByQuery = new Map<string, (value: ExperienceListResult) => void>();
    fetchSpy.mockImplementation(
      (params: { q?: string } = {}) =>
        new Promise<ExperienceListResult>((resolve) => pendingByQuery.set(params.q ?? '', resolve)),
    );

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );

    hook.rerender({ q: 'foo' });
    await waitFor(() => expect(pendingByQuery.has('foo')).toBe(true));

    await act(async () => {
      pendingByQuery.get('foo')!(listPage([item('foo-1')], 1));
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['foo-1']),
    );

    // The superseded head request settles late and must not repaint the view.
    await act(async () => {
      pendingByQuery.get('')!(listPage(idsOf(12), 24));
    });

    expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['foo-1']);
  });

  it('drops the painted page set on reset but keeps the persisted row', async () => {
    fetchSpy.mockResolvedValue(listPage([item('a')], 1));

    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['a']),
    );
    await waitFor(async () =>
      expect(
        (await experienceListResource.storage!.get({ queryKey: BASE_KEY, scope }))?.data,
      ).toBeDefined(),
    );

    act(() => useUserMemoryStore.getState().resetExperiencesList({ q: 'gone' }));

    expect(useUserMemoryStore.getState().experienceListData).toBeUndefined();
    expect(useUserMemoryStore.getState().experiences).toEqual([]);
    expect(useUserMemoryStore.getState().experiencesSearchLoading).toBe(true);
    const row = await experienceListResource.storage!.get({ queryKey: BASE_KEY, scope });
    expect(ids(row?.data as ExperienceListData)).toEqual(['a']);
  });

  it("paints the new query's cached head after the query changes", async () => {
    // The first query loads and leaves a replica entry for the shared key.
    fetchSpy.mockResolvedValueOnce(listPage(idsOf(12), 24));
    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );
    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(12));

    // An earlier session cached the new query's head.
    const cached: ExperienceListData = {
      currentPage: 0,
      hasMore: false,
      items: [item('cached-foo')],
      pageSize: 12,
      total: 1,
    };
    await experienceListResource.storage!.set(
      { queryKey: SEARCH_KEY, scope },
      { data: cached, updatedAt: 1 },
    );

    // The query changes and its network request never answers.
    fetchSpy.mockImplementation(pending);
    act(() => useUserMemoryStore.getState().resetExperiencesList({ q: 'foo' }));
    hook.rerender({ q: 'foo' });

    // The new query's cached head paints on the first frame (the reset dropped
    // the previous entry, so its hydrate is no longer rejected).
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['cached-foo']),
    );
  });

  it('re-hydrates the saved row when returning to an already-visited query', async () => {
    // Query A's head was cached by an earlier session.
    const cachedA: ExperienceListData = {
      currentPage: 0,
      hasMore: false,
      items: [item('cached-a')],
      pageSize: 12,
      total: 1,
    };
    await experienceListResource.storage!.set(
      { queryKey: BASE_KEY, scope },
      { data: cachedA, updatedAt: 1 },
    );
    fetchSpy.mockImplementation(pending);

    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['cached-a']),
    );

    // Move to query B: the reset drops A's entry but keeps A's saved row.
    act(() => useUserMemoryStore.getState().resetExperiencesList({ q: 'b' }));
    hook.rerender({ q: 'b' });
    expect(useUserMemoryStore.getState().experienceListData).toBeUndefined();

    // Back to A: its saved row paints again instead of staying blank while the
    // network never answers (the once-hydration is re-armed on reset).
    act(() => useUserMemoryStore.getState().resetExperiencesList({}));
    hook.rerender({ q: undefined });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['cached-a']),
    );
  });

  it('does not let a delayed read of the previous query repaint after the query changes', async () => {
    // An earlier session cached the previous query's head.
    const cachedBase: ExperienceListData = {
      currentPage: 0,
      hasMore: false,
      items: [item('cached-base')],
      pageSize: 12,
      total: 1,
    };
    await experienceListResource.storage!.set(
      { queryKey: BASE_KEY, scope },
      { data: cachedBase, updatedAt: 1 },
    );

    // Its hydrate read hangs, so it is still in flight when the query changes.
    const realGet = experienceListResource.storage!.get.bind(experienceListResource.storage);
    let release!: () => void;
    let deferred = false;
    const spy = vi.spyOn(experienceListResource.storage!, 'get').mockImplementation(async (key) => {
      if (!deferred && key.queryKey === BASE_KEY) {
        deferred = true;
        await new Promise<void>((resolve) => (release = resolve));
      }
      return realGet(key);
    });

    fetchSpy.mockImplementation(pending);
    const hook = renderHook(
      (props: { q?: string }) =>
        useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12, q: props.q }),
      { initialProps: {} as { q?: string }, wrapper },
    );
    await waitFor(() => expect(deferred).toBe(true));

    act(() => useUserMemoryStore.getState().resetExperiencesList({ q: 'foo' }));
    hook.rerender({ q: 'foo' });

    // The superseded read lands late: it must not repaint the cleared slot.
    await act(async () => {
      release();
      // Flush the hydrate continuation so a late paint would land before we look.
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(ids(useUserMemoryStore.getState().experienceListData)).toBeUndefined();

    spy.mockRestore();
  });

  it('drops a deleted experience from the view and the persisted row', async () => {
    let deleted = false;
    fetchSpy.mockImplementation(async () =>
      deleted ? listPage([item('b')], 1) : listPage([item('a'), item('b')], 2),
    );
    vi.spyOn(memoryCRUDService, 'deleteExperience').mockImplementation(async () => {
      deleted = true;
      return undefined as never;
    });

    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['a', 'b']),
    );

    await act(async () => {
      await useUserMemoryStore.getState().deleteExperience('a');
    });

    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['b']),
    );
    expect(useUserMemoryStore.getState().experiences.map((e) => e.id)).toEqual(['b']);

    await waitFor(async () => {
      const row = await experienceListResource.storage!.get({ queryKey: BASE_KEY, scope });
      expect(ids(row?.data as ExperienceListData)).toEqual(['b']);
    });
  });

  it('ignores the failure of a query the list has moved past', async () => {
    const rejectByQuery = new Map<string, (error: Error) => void>();
    fetchSpy.mockImplementation(
      (params: { q?: string } = {}) =>
        new Promise<ExperienceListResult>((_, reject) => rejectByQuery.set(params.q ?? '', reject)),
    );

    // A consumer still mounted on the previous query keeps its request live
    // (SWR's own same-hook key check does not apply), so only the replica's
    // current-query guard can keep its failure off the new search.
    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() => expect(rejectByQuery.has('')).toBe(true));

    act(() => useUserMemoryStore.getState().resetExperiencesList({ q: 'foo' }));
    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12, q: 'foo' }), {
      wrapper,
    });
    await waitFor(() => expect(rejectByQuery.has('foo')).toBe(true));

    // The superseded head request fails while the new search is still loading.
    await act(async () => {
      rejectByQuery.get('')!(new Error('stale failure'));
    });

    expect(useUserMemoryStore.getState().experiencesSearchError).toBeUndefined();
    expect(useUserMemoryStore.getState().experiencesSearchLoading).toBe(true);

    // The current query's own failure still surfaces.
    await act(async () => {
      rejectByQuery.get('foo')!(new Error('current failure'));
    });
    await waitFor(() =>
      expect(useUserMemoryStore.getState().experiencesSearchError).toMatchObject({
        message: 'current failure',
      }),
    );
    expect(useUserMemoryStore.getState().experiencesSearchLoading).toBe(false);
  });

  it('writes an edited experience through to the view and every persisted query', async () => {
    const searchRow: ExperienceListData = {
      currentPage: 0,
      hasMore: false,
      items: [{ ...item('a'), keyLearning: 'old' } as ExperienceListItem],
      pageSize: 12,
      q: 'foo',
      total: 1,
    };
    await seedSearchRow(searchRow);
    fetchSpy.mockResolvedValue(
      listPage([{ ...item('a'), keyLearning: 'old' } as ExperienceListItem, item('b')], 2),
    );
    vi.spyOn(memoryCRUDService, 'updateExperience').mockResolvedValue(undefined as never);

    const hook = renderHook(
      () => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }),
      { wrapper },
    );
    await waitFor(() =>
      expect(ids(useUserMemoryStore.getState().experienceListData)).toEqual(['a', 'b']),
    );
    // Model the edit landing while no list is mounted to revalidate it.
    hook.unmount();
    renderHook(() => null, { wrapper });

    await act(async () => {
      await useUserMemoryStore.getState().updateMemory('a', 'new', LayersEnum.Experience);
    });

    const keyLearningOf = (data?: ExperienceListData) =>
      data?.items.find((entry) => entry.id === 'a')?.keyLearning;
    expect(keyLearningOf(useUserMemoryStore.getState().experienceListData)).toBe('new');
    expect(useUserMemoryStore.getState().experiences.find((e) => e.id === 'a')?.keyLearning).toBe(
      'new',
    );
    await waitFor(async () => {
      const base = await experienceListResource.storage!.get({ queryKey: BASE_KEY, scope });
      expect(keyLearningOf(base?.data as ExperienceListData)).toBe('new');
      const search = await experienceListResource.storage!.get({ queryKey: SEARCH_KEY, scope });
      expect(keyLearningOf(search?.data as ExperienceListData)).toBe('new');
    });
  });

  it('removes the persisted projection when all memories are purged', async () => {
    await seedSearchRow({
      currentPage: 0,
      hasMore: false,
      items: [item('s')],
      pageSize: 12,
      total: 1,
    });
    fetchSpy.mockResolvedValue(listPage([item('a')], 1));
    vi.spyOn(memoryCRUDService, 'deleteAll').mockResolvedValue(undefined as never);

    const hook = renderHook(
      () => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }),
      { wrapper },
    );
    await waitFor(async () =>
      expect(
        ids(
          (await experienceListResource.storage!.get({ queryKey: BASE_KEY, scope }))
            ?.data as ExperienceListData,
        ),
      ).toEqual(['a']),
    );
    // Purge from a surface where the experience list is not mounted.
    hook.unmount();
    renderHook(() => null, { wrapper });

    await act(async () => {
      await useUserMemoryStore.getState().purgeAllMemories();
    });

    expect(useUserMemoryStore.getState().experienceListData).toBeUndefined();
    expect(useUserMemoryStore.getState().experiences).toEqual([]);
    expect(
      await experienceListResource.storage!.get({ queryKey: BASE_KEY, scope }),
    ).toBeUndefined();
    expect(
      await experienceListResource.storage!.get({ queryKey: SEARCH_KEY, scope }),
    ).toBeUndefined();
  });

  it('re-reads the head after a delete so load-more cannot skip the shifted row', async () => {
    // Offset paging by page index: page 1 is IDs 0..11, page 2 is 12..23.
    // Deleting ID 0 shifts everything, so the server's page 1 becomes 1..12 and
    // its page 2 becomes 13..24 — ID 12 crosses the boundary.
    let deleted = false;
    fetchSpy.mockImplementation(async (params: { page?: number } = {}) => {
      if ((params.page ?? 1) === 1) return listPage(deleted ? idsOf(12, 1) : idsOf(12), 24);
      return listPage(idsOf(12, 13), 24);
    });
    vi.spyOn(memoryCRUDService, 'deleteExperience').mockImplementation(async () => {
      deleted = true;
      return undefined as never;
    });

    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }), {
      wrapper,
    });
    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(12));

    await act(async () => {
      await useUserMemoryStore.getState().deleteExperience('experience-0');
    });

    // The head is re-read, so the loaded page set is back in step (1..12).
    await waitFor(() =>
      expect(useUserMemoryStore.getState().experiences.map((e) => e.id)).toEqual(
        idsOf(12, 1).map((e) => e.id),
      ),
    );

    act(() => useUserMemoryStore.getState().loadMoreExperiences());
    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(24));
    // The row that crossed the page boundary is present, never skipped.
    expect(useUserMemoryStore.getState().experiences.map((e) => e.id)).toContain('experience-12');
  });

  it('does not fetch another page when the head page is the last one', async () => {
    fetchSpy.mockResolvedValue(listPage([item('only')], 1));

    renderHook(() => useUserMemoryStore((s) => s.useFetchExperiences)({ pageSize: 12 }), {
      wrapper,
    });

    await waitFor(() => expect(useUserMemoryStore.getState().experiences).toHaveLength(1));
    expect(useUserMemoryStore.getState().experiencesHasMore).toBe(false);

    act(() => {
      useUserMemoryStore.getState().loadMoreExperiences();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
