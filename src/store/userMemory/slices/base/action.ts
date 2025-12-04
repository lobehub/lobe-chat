import isEqual from 'fast-deep-equal';
import { type SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { userMemoryService } from '@/services/userMemory';
import type { RetrieveMemoryParams, RetrieveMemoryResult } from '@/types/userMemory';
import { setNamespace } from '@/utils/storeDebug';

import { UserMemoryStore } from '../../store';
import { userMemoryCacheKey } from '../../utils/cacheKey';
import { createMemorySearchParams } from '../../utils/searchParams';

const SWR_FETCH_USER_MEMORY = 'SWR_FETCH_USER_MEMORY';
const n = setNamespace('userMemory');

type MemoryContext = Parameters<typeof createMemorySearchParams>[0];

export interface BaseAction {
  refreshUserMemory: (params: RetrieveMemoryParams) => Promise<void>;
  setActiveMemoryContext: (context?: MemoryContext) => void;
  useFetchUserMemory: (
    enable: boolean,
    params?: RetrieveMemoryParams,
  ) => SWRResponse<RetrieveMemoryResult>;
}

export const createBaseSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  BaseAction
> = (set, get) => ({
  refreshUserMemory: async (params) => {
    const key = userMemoryCacheKey(params);

    await mutate([SWR_FETCH_USER_MEMORY, key]);
  },

  setActiveMemoryContext: (context) => {
    const params = context ? createMemorySearchParams(context) : undefined;
    const key = params ? userMemoryCacheKey(params) : undefined;

    set(
      {
        activeParams: params,
        activeParamsKey: key,
      },
      false,
      n('setActiveMemoryContext', { key }),
    );
  },

  useFetchUserMemory: (enable, params) => {
    const resolvedParams = params ?? get().activeParams;
    const key = resolvedParams ? userMemoryCacheKey(resolvedParams) : undefined;

    return useClientDataSWR<RetrieveMemoryResult>(
      enable && resolvedParams ? [SWR_FETCH_USER_MEMORY, key] : null,
      () => userMemoryService.retrieveMemory(resolvedParams!),
      {
        onSuccess: (result) => {
          if (!resolvedParams || !key) return;

          const state = get();
          const previous = state.memoryMap[key];
          const next = result ?? { contexts: [], experiences: [], preferences: [] };
          const fetchedAt = Date.now();

          if (previous && isEqual(previous, next)) {
            set(
              {
                memoryFetchedAtMap: {
                  ...state.memoryFetchedAtMap,
                  [key]: fetchedAt,
                },
              },
              false,
              n('useFetchUserMemory/refresh', {
                key,
                totals: {
                  contexts: next.contexts.length,
                  experiences: next.experiences.length,
                  preferences: next.preferences.length,
                },
              }),
            );

            return;
          }

          set(
            {
              memoryFetchedAtMap: {
                ...state.memoryFetchedAtMap,
                [key]: fetchedAt,
              },
              memoryMap: {
                ...state.memoryMap,
                [key]: next,
              },
            },
            false,
            n('useFetchUserMemory/success', {
              key,
              totals: {
                contexts: next.contexts.length,
                experiences: next.experiences.length,
                preferences: next.preferences.length,
              },
            }),
          );
        },
      },
    );
  },
});
