import {
  NewUserMemoryIdentity,
  UserMemoryContext,
  UserMemoryExperience,
  UserMemoryIdentity,
  UserMemoryPreference,
} from '@lobechat/types';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { memoryService } from '@/services/userMemory';

import { UserMemoryStore } from '../../store';

export interface MemoryAction {
  createIdentity: (data: NewUserMemoryIdentity) => Promise<UserMemoryIdentity>;
  deleteIdentity: (id: string) => Promise<void>;
  updateIdentity: (id: string, data: Partial<NewUserMemoryIdentity>) => Promise<UserMemoryIdentity>;
  useFetchContexts: () => SWRResponse<UserMemoryContext[]>;
  useFetchExperiences: () => SWRResponse<UserMemoryExperience[]>;
  useFetchIdentities: () => SWRResponse<UserMemoryIdentity[]>;
  useFetchMemoryCount: () => SWRResponse<number>;
  useFetchPreferences: () => SWRResponse<UserMemoryPreference[]>;
}

const FETCH_MEMORY_COUNT_KEY = 'useFetchMemoryCount';
const FETCH_CONTEXTS_KEY = 'useFetchContexts';
const FETCH_PREFERENCES_KEY = 'useFetchPreferences';
const FETCH_IDENTITIES_KEY = 'useFetchIdentities';
const FETCH_EXPERIENCES_KEY = 'useFetchExperiences';

export const createMemorySlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  MemoryAction
> = () => ({
  createIdentity: async (data) => {
    const result = await memoryService.createIdentity(data);
    await mutate(FETCH_IDENTITIES_KEY);
    return result;
  },

  deleteIdentity: async (id) => {
    await memoryService.deleteIdentity(id);
    await mutate(FETCH_IDENTITIES_KEY);
  },

  updateIdentity: async (id, data) => {
    const result = await memoryService.updateIdentity(id, data);
    await mutate(FETCH_IDENTITIES_KEY);
    return result;
  },

  useFetchContexts: () =>
    useClientDataSWR<UserMemoryContext[]>(FETCH_CONTEXTS_KEY, () => memoryService.getContexts()),

  useFetchExperiences: () =>
    useClientDataSWR<UserMemoryExperience[]>(FETCH_EXPERIENCES_KEY, () =>
      memoryService.getExperiences(),
    ),

  useFetchIdentities: () =>
    useClientDataSWR<UserMemoryIdentity[]>(FETCH_IDENTITIES_KEY, () =>
      memoryService.getIdentities(),
    ),

  useFetchMemoryCount: () =>
    useClientDataSWR<number>(FETCH_MEMORY_COUNT_KEY, () => memoryService.countMemories()),

  useFetchPreferences: () =>
    useClientDataSWR<UserMemoryPreference[]>(FETCH_PREFERENCES_KEY, () =>
      memoryService.getPreferences(),
    ),
});
