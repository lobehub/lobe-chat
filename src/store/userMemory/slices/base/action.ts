import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_MEMORY_COUNT_KEY = 'useFetchMemoryCount';

export interface BaseAction {
  useFetchMemoryCount: () => SWRResponse<number>;
}

export const createBaseSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  BaseAction
> = () => ({
  useFetchMemoryCount: () =>
    useClientDataSWR<number>(FETCH_MEMORY_COUNT_KEY, () => memoryCRUDService.countMemories()),
});
