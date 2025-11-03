import type { RetrieveMemoryParams, RetrieveMemoryResult } from '@/types/userMemory';

export interface UserMemoryStoreState {
  activeParams?: RetrieveMemoryParams;
  activeParamsKey?: string;
  memoryFetchedAtMap: Record<string, number>;
  memoryMap: Record<string, RetrieveMemoryResult>;
}

export const initialState: UserMemoryStoreState = {
  activeParams: undefined,
  activeParamsKey: undefined,
  memoryFetchedAtMap: {},
  memoryMap: {},
};
