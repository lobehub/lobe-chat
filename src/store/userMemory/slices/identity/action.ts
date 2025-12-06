import {
  NewUserMemoryIdentity,
  UpdateUserMemoryIdentity,
  UserMemoryIdentityWithoutVectors,
} from '@lobechat/types';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { AddIdentityEntryResult } from '@/database/models/userMemory';
import { useClientDataSWR } from '@/libs/swr';
import { memoryCRUDService } from '@/services/userMemory/index';

import { UserMemoryStore } from '../../store';

const FETCH_IDENTITIES_KEY = 'useFetchIdentities';

export interface IdentityAction {
  createIdentity: (data: NewUserMemoryIdentity) => Promise<AddIdentityEntryResult>;
  deleteIdentity: (id: string) => Promise<void>;
  updateIdentity: (id: string, data: UpdateUserMemoryIdentity) => Promise<boolean>;
  useFetchIdentities: () => SWRResponse<UserMemoryIdentityWithoutVectors[]>;
}

export const createIdentitySlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  IdentityAction
> = () => ({
  createIdentity: async (data) => {
    const result = await memoryCRUDService.createIdentity(data);
    await mutate(FETCH_IDENTITIES_KEY);
    return result;
  },

  deleteIdentity: async (id) => {
    await memoryCRUDService.deleteIdentity(id);
    await mutate(FETCH_IDENTITIES_KEY);
  },

  updateIdentity: async (id, data) => {
    const result = await memoryCRUDService.updateIdentity(id, data);
    await mutate(FETCH_IDENTITIES_KEY);
    return result;
  },

  useFetchIdentities: () => useClientDataSWR(FETCH_IDENTITIES_KEY, memoryCRUDService.getIdentities),
});
