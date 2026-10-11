/**
 * @vitest-environment happy-dom
 *
 * The user-memory base slice's server reads are `@lobechat/replica` resources:
 * the retrieve result map and one memory detail per `${layer}:${id}`. These
 * tests pin the local-first guarantees and the shape the existing consumers
 * keep reading (`memoryMap` / `memoryDetailMap`), plus the purge that drops the
 * views and their persisted rows through the engine.
 */
import { randomUUID } from 'node:crypto';

import { type RetrieveMemoryParams, type RetrieveMemoryResult } from '@lobechat/types';
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
import { registerUserMemoryReplica } from '../../replicaRegistry';
import { useUserMemoryStore } from '../../store';
import {
  memoryDetailKey,
  userMemoryDetailResource,
  userMemoryRetrieveResource,
} from './projection';

const PARAMS = { queries: ['alpha'] } as RetrieveMemoryParams;
const RETRIEVE_KEY = userMemoryRetrieveResource.key(PARAMS);
const OTHER_PARAMS = { queries: ['beta'] } as RetrieveMemoryParams;
const OTHER_RETRIEVE_KEY = userMemoryRetrieveResource.key(OTHER_PARAMS);
const DETAIL_PARAMS = { id: 'pref-1', layer: LayersEnum.Preference };
const DETAIL_KEY = memoryDetailKey(DETAIL_PARAMS);

const emptyResult = (): RetrieveMemoryResult => ({
  activities: [],
  contexts: [],
  experiences: [],
  preferences: [],
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

describe('userMemory base replica', () => {
  const scopes = new Set<string>();
  let scope = '';
  let retrieveSpy: ReturnType<typeof vi.spyOn>;
  let detailSpy: ReturnType<typeof vi.spyOn>;

  const useScope = (next: string) => {
    scope = next;
    scopes.add(next);
    vi.spyOn(cacheScope, 'get').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'use').mockImplementation(() => scope);
    vi.spyOn(cacheScope, 'canPersist').mockReturnValue(true);
  };

  beforeEach(() => {
    useScope(`base-user-${randomUUID()}:personal`);
    retrieveSpy = vi.spyOn(userMemoryService, 'retrieveMemory');
    detailSpy = vi.spyOn(userMemoryService, 'getMemoryDetail');
    act(() => useUserMemoryStore.setState(initialState, false));
  });

  afterEach(async () => {
    cleanup();
    await Promise.all(
      [...scopes].flatMap((value) =>
        [RETRIEVE_KEY, OTHER_RETRIEVE_KEY].map((queryKey) =>
          userMemoryRetrieveResource.storage!.remove({ queryKey, scope: value }),
        ),
      ),
    );
    scopes.clear();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('retrieve map', () => {
    it('paints the persisted result before the network answers', async () => {
      const cached: RetrieveMemoryResult = {
        ...emptyResult(),
        preferences: [{ id: 'cached-1' } as never],
      };
      await userMemoryRetrieveResource.storage!.set(
        { queryKey: RETRIEVE_KEY, scope },
        { data: cached, updatedAt: 1 },
      );
      retrieveSpy.mockImplementation(pending);

      renderHook(() => useUserMemoryStore((s) => s.useFetchUserMemory)(true, PARAMS), { wrapper });

      await waitFor(() =>
        expect(useUserMemoryStore.getState().memoryMap[RETRIEVE_KEY]).toEqual(cached),
      );
      expect(useUserMemoryStore.getState().memoryFetchedAtMap[RETRIEVE_KEY]).toBeTypeOf('number');
    });

    it('confirms the server result and persists it', async () => {
      const server: RetrieveMemoryResult = {
        ...emptyResult(),
        activities: [{ id: 'a-1' } as never],
      };
      retrieveSpy.mockResolvedValue(server);

      renderHook(() => useUserMemoryStore((s) => s.useFetchUserMemory)(true, PARAMS), { wrapper });

      await waitFor(() =>
        expect(useUserMemoryStore.getState().memoryMap[RETRIEVE_KEY]).toEqual(server),
      );
      await waitFor(async () => {
        const row = await userMemoryRetrieveResource.storage!.get({
          queryKey: RETRIEVE_KEY,
          scope,
        });
        expect(row?.data).toEqual(server);
      });
    });

    it('does not fetch while the caller disables it', () => {
      retrieveSpy.mockResolvedValue(emptyResult());

      renderHook(() => useUserMemoryStore((s) => s.useFetchUserMemory)(false, PARAMS), { wrapper });

      expect(retrieveSpy).not.toHaveBeenCalled();
    });
  });

  describe('memory detail', () => {
    it('flattens the detail into memoryDetailMap and returns it from the hook', async () => {
      detailSpy.mockResolvedValue({
        layer: LayersEnum.Preference,
        memory: { id: 'mem-1', tags: [], title: 'Preference' },
        preference: { conclusionDirectives: 'Prefer concise answers.', id: 'pref-1' },
        source: { id: 'topic-1' },
        sourceType: 'chat_topic',
      } as never);

      const { result } = renderHook(
        () => useUserMemoryStore((s) => s.useFetchMemoryDetail)('pref-1', LayersEnum.Preference),
        { wrapper },
      );

      await waitFor(() =>
        expect(result.current.data).toMatchObject({
          conclusionDirectives: 'Prefer concise answers.',
          id: 'pref-1',
          sourceType: 'chat_topic',
          title: 'Preference',
        }),
      );
      expect(useUserMemoryStore.getState().memoryDetailMap[DETAIL_KEY]).toMatchObject({
        conclusionDirectives: 'Prefer concise answers.',
        id: 'pref-1',
      });
      expect(detailSpy).toHaveBeenCalledWith({ id: 'pref-1', layer: LayersEnum.Preference });
    });

    it('returns empty when the memory is gone', async () => {
      detailSpy.mockResolvedValue(null as never);

      const { result } = renderHook(
        () => useUserMemoryStore((s) => s.useFetchMemoryDetail)('pref-1', LayersEnum.Preference),
        { wrapper },
      );

      await waitFor(() => expect(detailSpy).toHaveBeenCalled());
      expect(result.current.data).toBeUndefined();
      expect(useUserMemoryStore.getState().memoryDetailMap).toEqual({});
    });

    it('removes a loaded detail when a later fetch reports it missing', async () => {
      detailSpy.mockResolvedValue({
        layer: LayersEnum.Preference,
        memory: { id: 'mem-1', tags: [], title: 'Preference' },
        preference: { conclusionDirectives: 'x', id: 'pref-1' },
      } as never);

      const { result } = renderHook(
        () => useUserMemoryStore((s) => s.useFetchMemoryDetail)('pref-1', LayersEnum.Preference),
        { wrapper },
      );
      await waitFor(() => expect(result.current.data).toBeDefined());

      // Deleted in another tab: the revalidation answers "no such memory".
      detailSpy.mockResolvedValue(null as never);
      await act(async () => {
        await result.current.mutate();
      });

      await waitFor(() => expect(result.current.data).toBeUndefined());
      expect(useUserMemoryStore.getState().memoryDetailMap[DETAIL_KEY]).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('does not fetch without an id', () => {
      detailSpy.mockResolvedValue(null as never);

      renderHook(
        () => useUserMemoryStore((s) => s.useFetchMemoryDetail)(null, LayersEnum.Preference),
        { wrapper },
      );

      expect(detailSpy).not.toHaveBeenCalled();
    });
  });

  describe('purgeAllMemories', () => {
    it('drops the retrieve/detail views and the persisted retrieve row', async () => {
      const server: RetrieveMemoryResult = {
        ...emptyResult(),
        preferences: [{ id: 'p' } as never],
      };
      retrieveSpy.mockResolvedValue(server);
      detailSpy.mockResolvedValue({
        layer: LayersEnum.Preference,
        memory: { id: 'mem-1', tags: [], title: 'Preference' },
        preference: { conclusionDirectives: 'x', id: 'pref-1' },
      } as never);
      vi.spyOn(memoryCRUDService, 'deleteAll').mockResolvedValue({} as never);

      renderHook(
        () => ({
          detail: useUserMemoryStore((s) => s.useFetchMemoryDetail)(
            'pref-1',
            LayersEnum.Preference,
          ),
          retrieve: useUserMemoryStore((s) => s.useFetchUserMemory)(true, PARAMS),
        }),
        { wrapper },
      );

      await waitFor(() =>
        expect(useUserMemoryStore.getState().memoryMap[RETRIEVE_KEY]).toBeDefined(),
      );
      await waitFor(() =>
        expect(useUserMemoryStore.getState().memoryDetailMap[DETAIL_KEY]).toBeDefined(),
      );
      await waitFor(async () =>
        expect(
          await userMemoryRetrieveResource.storage!.get({ queryKey: RETRIEVE_KEY, scope }),
        ).toBeDefined(),
      );

      // After the purge the server has nothing left to answer with.
      retrieveSpy.mockImplementation(pending);
      detailSpy.mockImplementation(pending);
      await act(async () => {
        await useUserMemoryStore.getState().purgeAllMemories();
      });

      expect(useUserMemoryStore.getState().memoryMap).toEqual({});
      expect(useUserMemoryStore.getState().memoryDetailMap).toEqual({});
      expect(useUserMemoryStore.getState().memoryFetchedAtMap).toEqual({});
      const row = await userMemoryRetrieveResource.storage!.get({ queryKey: RETRIEVE_KEY, scope });
      expect(row).toBeUndefined();
    });

    it('purges persisted retrieve rows of queries that are not loaded in memory', async () => {
      retrieveSpy.mockResolvedValue({ ...emptyResult(), preferences: [{ id: 'old' } as never] });
      vi.spyOn(memoryCRUDService, 'deleteAll').mockResolvedValue({} as never);

      // An earlier session persisted OTHER_PARAMS; after a reload it is not in memory.
      const earlier = renderHook(
        () => useUserMemoryStore((s) => s.useFetchUserMemory)(true, OTHER_PARAMS),
        { wrapper },
      );
      await waitFor(async () =>
        expect(
          await userMemoryRetrieveResource.storage!.get({ queryKey: OTHER_RETRIEVE_KEY, scope }),
        ).toBeDefined(),
      );
      earlier.unmount();
      // Keep an SWR provider mounted for the purge's legacy cache mutations.
      renderHook(() => null, { wrapper });
      act(() => useUserMemoryStore.setState(initialState, false));
      expect(useUserMemoryStore.getState().memoryMap).toEqual({});

      await act(async () => {
        await useUserMemoryStore.getState().purgeAllMemories();
      });

      expect(
        await userMemoryRetrieveResource.storage!.get({ queryKey: OTHER_RETRIEVE_KEY, scope }),
      ).toBeUndefined();

      // Requesting that query again paints nothing deleted while the fetch is pending.
      retrieveSpy.mockImplementation(pending);
      const reloaded = renderHook(
        () => useUserMemoryStore((s) => s.useFetchUserMemory)(true, OTHER_PARAMS),
        { wrapper },
      );
      await waitFor(() => expect(reloaded.result.current.isLoading).toBe(true));
      expect(useUserMemoryStore.getState().memoryMap[OTHER_RETRIEVE_KEY]).toBeUndefined();
    });

    it('clears every registered replica, and leaves owned layers to them', async () => {
      vi.spyOn(memoryCRUDService, 'deleteAll').mockResolvedValue({} as never);
      const clear = vi.fn(async () => true);
      const unregister = registerUserMemoryReplica(useUserMemoryStore.getState, 'activityTest', {
        clear,
        layer: LayersEnum.Activity,
      });
      renderHook(() => null, { wrapper });
      const ownedActivities = [{ id: 'replica-owned' }] as never;
      act(() =>
        useUserMemoryStore.setState({
          activities: ownedActivities,
          contexts: [{ id: 'legacy' }] as never,
        }),
      );

      try {
        await act(async () => {
          await useUserMemoryStore.getState().purgeAllMemories();
        });

        expect(clear).toHaveBeenCalledTimes(1);
        // The replica owns the activity list: no legacy plain reset over its view.
        expect(useUserMemoryStore.getState().activities).toBe(ownedActivities);
        // Unmigrated layers keep the legacy reset.
        expect(useUserMemoryStore.getState().contexts).toEqual([]);
      } finally {
        unregister();
      }
    });
  });

  describe('updateMemory', () => {
    // Keep an SWR provider mounted for the legacy cache revalidation.
    beforeEach(() => {
      renderHook(() => null, { wrapper });
    });

    it('hands an edit of a replica-owned layer to its replica instead of a plain patch', async () => {
      vi.spyOn(memoryCRUDService, 'updateActivity').mockResolvedValue({} as never);
      const update = vi.fn();
      const unregister = registerUserMemoryReplica(useUserMemoryStore.getState, 'activityTest', {
        clear: async () => true,
        layer: LayersEnum.Activity,
        update,
      });
      const activities = [{ id: 'act-1', narrative: 'old' }] as never;
      act(() => useUserMemoryStore.setState({ activities }));

      try {
        await act(async () => {
          await useUserMemoryStore.getState().updateMemory('act-1', 'new', LayersEnum.Activity);
        });

        expect(update).toHaveBeenCalledWith({
          content: 'new',
          id: 'act-1',
          layer: LayersEnum.Activity,
        });
        expect(useUserMemoryStore.getState().activities).toBe(activities);
      } finally {
        unregister();
      }
    });

    it('patches an unmigrated layer through the legacy plain state', async () => {
      vi.spyOn(memoryCRUDService, 'updateContext').mockResolvedValue({} as never);
      act(() =>
        useUserMemoryStore.setState({ contexts: [{ description: 'old', id: 'ctx-1' }] as never }),
      );

      await act(async () => {
        await useUserMemoryStore.getState().updateMemory('ctx-1', 'new', LayersEnum.Context);
      });

      expect(memoryCRUDService.updateContext).toHaveBeenCalledWith('ctx-1', {
        description: 'new',
      });
      expect(useUserMemoryStore.getState().contexts[0]).toMatchObject({ description: 'new' });
    });
  });

  it('uses the long-standing SWR keys as the sync keys', () => {
    expect(userMemoryRetrieveResource.syncKey?.(PARAMS)).toEqual([
      'userMemory:retrieve',
      RETRIEVE_KEY,
    ]);
    expect(userMemoryDetailResource.syncKey?.(DETAIL_PARAMS)).toEqual([
      'userMemory:memoryDetail',
      'preference',
      'pref-1',
    ]);
  });
});
