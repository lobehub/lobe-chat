import { StateCreator } from 'zustand/vanilla';

import { userMemoryService } from '@/services/userMemory';
import { ChatStore } from '@/store/chat/store';
import type { SearchMemoryParams } from '@/types/userMemory';

export interface UserMemoryAction {
  searchUserMemory: (id: string, params: SearchMemoryParams) => Promise<boolean>;
}

export const userMemorySlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  UserMemoryAction
> = (set, get) => ({
  searchUserMemory: async (id, params) => {
    const { optimisticUpdateMessageContent } = get();

    try {
      const result = await userMemoryService.searchMemory(params);
      await optimisticUpdateMessageContent(id, JSON.stringify(result));
      return true;
    } catch (error) {
      console.error('Failed to retrieve memories:', error);
      const errorResult = {
        contexts: [],
        error: `Failed to retrieve memories: ${(error as Error).message}`,
        experiences: [],
        preferences: [],
      };

      await optimisticUpdateMessageContent(id, JSON.stringify(errorResult));
      return false;
    }
  },
});
