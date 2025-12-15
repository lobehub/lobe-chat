import { StateCreator } from 'zustand/vanilla';

import { userMemoryService } from '@/services/userMemory';
import { memoryCRUDService } from '@/services/userMemory/index';
import { LayersEnum } from '@/types/userMemory';

import { UserMemoryStore } from '../../store';

const n = (namespace: string) => namespace;

export interface ContextAction {
  deleteContext: (id: string) => Promise<void>;
  loadMoreContexts: () => Promise<void>;
  refreshContexts: (params?: { q?: string; sort?: 'createdAt' | 'updatedAt' }) => Promise<void>;
}

export const createContextSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  ContextAction
> = (set, get) => ({
  deleteContext: async (id) => {
    await memoryCRUDService.deleteContext(id);
    await get().refreshContexts();
  },

  loadMoreContexts: async () => {
    const state = get();
    if (state.contextsIsLoading || !state.contextsHasMore) return;

    set({ contextsIsLoading: true }, false, n('loadMoreContexts/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Context],
        page: state.contextsPage + 1,
        pageSize: 20,
        sort: 'createdAt',
      });

      const hasMore = result.items.length > 0 && result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.memory,
        ...item.context,
        source: null,
      }));

      set(
        {
          contexts: [...state.contexts, ...transformedItems],
          contextsHasMore: hasMore,
          contextsInit: true,
          contextsIsLoading: false,
          contextsPage: state.contextsPage + 1,
          contextsTotal: result.total,
        },
        false,
        n('loadMoreContexts/success'),
      );
    } catch (error) {
      console.error('Failed to load more contexts:', error);
      set({ contextsIsLoading: false }, false, n('loadMoreContexts/error'));
    }
  },

  refreshContexts: async (params) => {
    set({ contextsIsLoading: true }, false, n('refreshContexts/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Context],
        page: 1,
        pageSize: 20,
        q: params?.q,
        sort: params?.sort || 'createdAt',
      });

      const hasMore = result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.memory,
        ...item.context,
        source: null,
      }));

      set(
        {
          contexts: transformedItems,
          contextsHasMore: hasMore,
          contextsInit: true,
          contextsIsLoading: false,
          contextsPage: 1,
          contextsTotal: result.total,
        },
        false,
        n('refreshContexts/success'),
      );
    } catch (error) {
      console.error('Failed to refresh contexts:', error);
      set({ contextsIsLoading: false }, false, n('refreshContexts/error'));
    }
  },
});
