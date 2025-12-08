import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { DisplayContextMemory } from '@/database/repositories/userMemory';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_CONTEXTS_KEY = 'useFetchContexts';

export interface ContextAction {
  deleteContext: (id: string) => Promise<void>;
  useFetchContexts: () => SWRResponse<DisplayContextMemory[]>;
}

export const createContextSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  ContextAction
> = () => ({
  deleteContext: async (id) => {
    await memoryCRUDService.deleteContext(id);
    await mutate(FETCH_CONTEXTS_KEY);
  },
  useFetchContexts: () =>
    useClientDataSWR(FETCH_CONTEXTS_KEY, memoryCRUDService.getDisplayContexts),
});
