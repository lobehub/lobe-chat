import { StateCreator } from 'zustand/vanilla';

import { userMemoryService } from '@/services/userMemory';
import { memoryCRUDService } from '@/services/userMemory/index';
import { LayersEnum } from '@/types/userMemory';

import { UserMemoryStore } from '../../store';

const n = (namespace: string) => namespace;

export interface ExperienceAction {
  deleteExperience: (id: string) => Promise<void>;
  loadMoreExperiences: () => Promise<void>;
  refreshExperiences: (params?: { q?: string; sort?: 'createdAt' | 'updatedAt' }) => Promise<void>;
}

export const createExperienceSlice: StateCreator<
  UserMemoryStore,
  [['zustand/devtools', never]],
  [],
  ExperienceAction
> = (set, get) => ({
  deleteExperience: async (id) => {
    await memoryCRUDService.deleteExperience(id);
    await get().refreshExperiences();
  },

  loadMoreExperiences: async () => {
    const state = get();
    if (state.experiencesIsLoading || !state.experiencesHasMore) return;

    set({ experiencesIsLoading: true }, false, n('loadMoreExperiences/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Experience],
        page: state.experiencesPage + 1,
        pageSize: 20,
        sort: 'createdAt',
      });

      const hasMore = result.items.length > 0 && result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.memory,
        ...item.experience,
      }));

      set(
        {
          experiences: [...state.experiences, ...transformedItems],
          experiencesHasMore: hasMore,
          experiencesInit: true,
          experiencesIsLoading: false,
          experiencesPage: state.experiencesPage + 1,
          experiencesTotal: result.total,
        },
        false,
        n('loadMoreExperiences/success'),
      );
    } catch (error) {
      console.error('Failed to load more experiences:', error);
      set({ experiencesIsLoading: false }, false, n('loadMoreExperiences/error'));
    }
  },

  refreshExperiences: async (params) => {
    set({ experiencesIsLoading: true }, false, n('refreshExperiences/start'));

    try {
      const result = await userMemoryService.queryMemories({
        layers: [LayersEnum.Experience],
        page: 1,
        pageSize: 20,
        q: params?.q,
        sort: params?.sort || 'createdAt',
      });

      const hasMore = result.items.length >= 20;

      // Transform nested structure to flat structure
      const transformedItems = result.items.map((item: any) => ({
        ...item.memory,
        ...item.experience,
      }));

      set(
        {
          experiences: transformedItems,
          experiencesHasMore: hasMore,
          experiencesInit: true,
          experiencesIsLoading: false,
          experiencesPage: 1,
          experiencesTotal: result.total,
        },
        false,
        n('refreshExperiences/success'),
      );
    } catch (error) {
      console.error('Failed to refresh experiences:', error);
      set({ experiencesIsLoading: false }, false, n('refreshExperiences/error'));
    }
  },
});
