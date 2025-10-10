import { StateCreator } from 'zustand/vanilla';

import { userMemoryService } from '@/services/userMemory';
import { ChatStore } from '@/store/chat/store';
import type {
  CategorizeMemoryContextParams,
  CategorizeMemoryPreferenceParams,
  RetrieveMemoryParams,
  SaveMemoryParams,
} from '@/types/userMemory';

export interface MemoryAction {
  categorizeContext: (id: string, params: CategorizeMemoryContextParams) => Promise<boolean>;
  categorizePreference: (id: string, params: CategorizeMemoryPreferenceParams) => Promise<boolean>;
  retrieveMemory: (id: string, params: RetrieveMemoryParams) => Promise<boolean>;
  saveMemory: (id: string, params: SaveMemoryParams) => Promise<boolean>;
}

export const memorySlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  MemoryAction
> = (set, get) => ({
  categorizeContext: async (id, params) => {
    const { internal_updateMessageContent } = get();

    try {
      const result = await userMemoryService.categorizeContext(params);
      await internal_updateMessageContent(id, JSON.stringify(result));
      return false;
    } catch (error) {
      console.error('Failed to categorize context:', error);
      const errorResult = {
        message: `Failed to categorize context: ${(error as Error).message}`,
        success: false,
      };

      await internal_updateMessageContent(id, JSON.stringify(errorResult));
      return false;
    }
  },

  categorizePreference: async (id, params) => {
    const { internal_updateMessageContent } = get();

    try {
      const result = await userMemoryService.categorizePreference(params);
      await internal_updateMessageContent(id, JSON.stringify(result));
      return false;
    } catch (error) {
      console.error('Failed to categorize preference:', error);
      const errorResult = {
        message: `Failed to categorize preference: ${(error as Error).message}`,
        success: false,
      };

      await internal_updateMessageContent(id, JSON.stringify(errorResult));
      return false;
    }
  },

  retrieveMemory: async (id, params) => {
    const { internal_updateMessageContent } = get();

    try {
      const result = await userMemoryService.retrieveMemory(params);
      await internal_updateMessageContent(id, JSON.stringify(result));
      return true;
    } catch (error) {
      console.error('Failed to retrieve memories:', error);
      const errorResult = {
        error: `Failed to retrieve memories: ${(error as Error).message}`,
        memories: [],
      };

      await internal_updateMessageContent(id, JSON.stringify(errorResult));
      return false;
    }
  },

  saveMemory: async (id, params) => {
    const { internal_updateMessageContent } = get();

    try {
      const result = await userMemoryService.saveMemory(params);
      await internal_updateMessageContent(id, JSON.stringify(result));
      return false;
    } catch (error) {
      console.error('Failed to save memory:', error);
      const errorResult = {
        message: `Failed to save memory: ${(error as Error).message}`,
        success: false,
      };

      await internal_updateMessageContent(id, JSON.stringify(errorResult));
      return false;
    }
  },
});
