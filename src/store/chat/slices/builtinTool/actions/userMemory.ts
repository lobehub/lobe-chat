import type {
  AddIdentityActionSchema,
  ContextMemoryItemSchema,
  ExperienceMemoryItemSchema,
  PreferenceMemoryItemSchema,
  RemoveIdentityActionSchema,
  UpdateIdentityActionSchema,
} from '@lobechat/memory-user-memory/schemas';
import { z } from 'zod';
import { StateCreator } from 'zustand/vanilla';

import { userMemoryService } from '@/services/userMemory';
import { ChatStore } from '@/store/chat/store';
import { SearchMemoryParams } from '@/types/userMemory';

export interface UserMemoryAction {
  addContextMemory: (
    id: string,
    params: z.infer<typeof ContextMemoryItemSchema>,
  ) => Promise<boolean>;
  addExperienceMemory: (
    id: string,
    params: z.infer<typeof ExperienceMemoryItemSchema>,
  ) => Promise<boolean>;
  addIdentityMemory: (
    id: string,
    params: z.infer<typeof AddIdentityActionSchema>,
  ) => Promise<boolean>;
  addPreferenceMemory: (
    id: string,
    params: z.infer<typeof PreferenceMemoryItemSchema>,
  ) => Promise<boolean>;
  removeIdentityMemory: (
    id: string,
    params: z.infer<typeof RemoveIdentityActionSchema>,
  ) => Promise<boolean>;
  searchUserMemory: (id: string, params: SearchMemoryParams) => Promise<boolean>;
  updateIdentityMemory: (
    id: string,
    params: z.infer<typeof UpdateIdentityActionSchema>,
  ) => Promise<boolean>;
}

const runMemoryTool = async (
  id: string,
  executor: () => Promise<unknown>,
  get: () => ChatStore,
  errorPayload?: (error: Error) => unknown,
): Promise<boolean> => {
  const {
    completeOperation,
    failOperation,
    messageOperationMap,
    optimisticUpdateMessageContent,
    optimisticUpdateMessagePluginError,
    startOperation,
  } = get();

  const parentOperationId = messageOperationMap[id];
  const { operationId } = startOperation({
    context: { messageId: id },
    metadata: { startTime: Date.now() },
    parentOperationId,
    type: 'builtinToolMemory',
  });
  const context = { operationId };

  try {
    const result = await executor();
    completeOperation(operationId);
    await optimisticUpdateMessageContent(id, JSON.stringify(result), undefined, context);

    if (typeof (result as any)?.success === 'boolean') return (result as any).success;

    return true;
  } catch (error) {
    const err = error as Error;

    console.error('Failed to run memory tool:', err);

    failOperation(operationId, {
      message: err.message,
      type: 'PluginServerError',
    });

    await optimisticUpdateMessagePluginError(
      id,
      {
        body: error,
        message: err.message,
        type: 'PluginServerError',
      },
      context,
    );

    const fallback = errorPayload?.(err) ?? {
      message: `Failed to run memory tool: ${err.message}`,
      success: false,
    };

    await optimisticUpdateMessageContent(id, JSON.stringify(fallback), undefined, context);

    return false;
  }
};

export const userMemorySlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  UserMemoryAction
> = (_set, get) => ({
  addContextMemory: async (id, params) => {
    return runMemoryTool(id, () => userMemoryService.addContextMemory(params), get);
  },

  addExperienceMemory: async (id, params) => {
    return runMemoryTool(id, () => userMemoryService.addExperienceMemory(params), get);
  },

  addIdentityMemory: async (id, params) => {
    return runMemoryTool(id, () => userMemoryService.addIdentityMemory(params), get);
  },

  addPreferenceMemory: async (id, params) => {
    return runMemoryTool(id, () => userMemoryService.addPreferenceMemory(params), get);
  },

  removeIdentityMemory: async (id, params) => {
    return runMemoryTool(id, () => userMemoryService.removeIdentityMemory(params), get);
  },

  searchUserMemory: async (id, params) => {
    return runMemoryTool(
      id,
      () => userMemoryService.searchMemory(params),
      get,
      (error) => ({
        contexts: [],
        error: `Failed to retrieve memories: ${error.message}`,
        experiences: [],
        preferences: [],
        success: false,
      }),
    );
  },

  updateIdentityMemory: async (id, params) => {
    return runMemoryTool(id, () => userMemoryService.updateIdentityMemory(params), get);
  },
});
