import { StateCreator } from 'zustand/vanilla';

import { userMemoryService } from '@/services/userMemory';
import { memoryCRUDService } from '@/services/userMemory/index';
import { LayersEnum } from '@/types/userMemory';

import { UserMemoryStore } from '../../store';

const n = (namespace: string) => namespace;

export interface PreferenceAction {
  deletePreference: (id: string) => Promise<void>;
  loadMorePreferences: () => Promise<void>;
  refreshPreferences: (params?: { q?: string; sort?: 'createdAt' | 'updatedAt' }) => Promise<void>;
}

export const createPreferenceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  PreferenceAction
> = (set, get) => ({
  deletePreference: async (id) => {
    await memoryCRUDService.deletePreference(id);
    await get().refreshPreferences();
  },

  loadMorePreferences: async () => {
    const state = get();
    if (state.preferencesIsLoading || !state.preferencesHasMore) return;

    set({ preferencesIsLoading: true }, false, n('loadMorePreferences/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Preference],
        page: state.preferencesPage + 1,
        pageSize: 20,
        sort: 'createdAt',
      });

      const hasMore = result.items.length > 0 && result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.preference,
        ...item.memory,
      }));

      set(
        {
          preferences: [...state.preferences, ...transformedItems],
          preferencesHasMore: hasMore,
          preferencesInit: true,
          preferencesIsLoading: false,
          preferencesPage: state.preferencesPage + 1,
          preferencesTotal: result.total,
        },
        false,
        n('loadMorePreferences/success'),
      );
    } catch (error) {
      console.error('Failed to load more preferences:', error);
      set({ preferencesIsLoading: false }, false, n('loadMorePreferences/error'));
    }
  },

  refreshPreferences: async (params) => {
    set({ preferencesIsLoading: true }, false, n('refreshPreferences/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Preference],
        page: 1,
        pageSize: 20,
        q: params?.q,
        sort: params?.sort || 'createdAt',
      });

      const hasMore = result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.memory,
        ...item.preference,
      }));

      set(
        {
          preferences: transformedItems,
          preferencesHasMore: hasMore,
          preferencesInit: true,
          preferencesIsLoading: false,
          preferencesPage: 1,
          preferencesTotal: result.total,
        },
        false,
        n('refreshPreferences/success'),
      );
    } catch (error) {
      console.error('Failed to refresh preferences:', error);
      set({ preferencesIsLoading: false }, false, n('refreshPreferences/error'));
    }
  },
});
