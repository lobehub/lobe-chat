import {
  NewUserMemoryIdentity,
  UpdateUserMemoryIdentity,
} from '@lobechat/types';
import { StateCreator } from 'zustand/vanilla';

import { AddIdentityEntryResult } from '@/database/models/userMemory';
import { userMemoryService } from '@/services/userMemory';
import { memoryCRUDService } from '@/services/userMemory/index';
import { LayersEnum, TypesEnum } from '@/types/userMemory';

import { UserMemoryStore } from '../../store';

const n = (namespace: string) => namespace;

export interface IdentityAction {
  createIdentity: (data: NewUserMemoryIdentity) => Promise<AddIdentityEntryResult>;
  deleteIdentity: (id: string) => Promise<void>;
  loadMoreIdentities: () => Promise<void>;
  refreshIdentities: (params?: {
    q?: string;
    sort?: 'createdAt' | 'updatedAt';
    types?: TypesEnum[];
  }) => Promise<void>;
  updateIdentity: (id: string, data: UpdateUserMemoryIdentity) => Promise<boolean>;
}

export const createIdentitySlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  IdentityAction
> = (set, get) => ({
  createIdentity: async (data) => {
    const result = await memoryCRUDService.createIdentity(data);
    await get().refreshIdentities();
    return result;
  },

  deleteIdentity: async (id) => {
    await memoryCRUDService.deleteIdentity(id);
    await get().refreshIdentities();
  },

  loadMoreIdentities: async () => {
    const state = get();
    if (state.identitiesIsLoading || !state.identitiesHasMore) return;

    set({ identitiesIsLoading: true }, false, n('loadMoreIdentities/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Identity],
        page: state.identitiesPage + 1,
        pageSize: 20,
        sort: 'createdAt',
      });

      const hasMore = result.items.length > 0 && result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.memory,
        ...item.identity,
      }));

      set(
        {
          identities: [...state.identities, ...transformedItems],
          identitiesHasMore: hasMore,
          identitiesInit: true,
          identitiesIsLoading: false,
          identitiesPage: state.identitiesPage + 1,
          identitiesTotal: result.total,
        },
        false,
        n('loadMoreIdentities/success'),
      );
    } catch (error) {
      console.error('Failed to load more identities:', error);
      set({ identitiesIsLoading: false }, false, n('loadMoreIdentities/error'));
    }
  },

  refreshIdentities: async (params) => {
    set({ identitiesIsLoading: true }, false, n('refreshIdentities/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Identity],
        page: 1,
        pageSize: 20,
        q: params?.q,
        sort: params?.sort || 'createdAt',
        types: params?.types,
      });

      const hasMore = result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.memory,
        ...item.identity,
      }));

      set(
        {
          identities: transformedItems,
          identitiesHasMore: hasMore,
          identitiesInit: true,
          identitiesIsLoading: false,
          identitiesPage: 1,
          identitiesTotal: result.total,
        },
        false,
        n('refreshIdentities/success'),
      );
    } catch (error) {
      console.error('Failed to refresh identities:', error);
      set({ identitiesIsLoading: false }, false, n('refreshIdentities/error'));
    }
  },

  updateIdentity: async (id, data) => {
    const result = await memoryCRUDService.updateIdentity(id, data);
    await get().refreshIdentities();
    return result;
  },
});
