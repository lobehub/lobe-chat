import debug from 'debug';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { AgentBuilderExecutionRuntime } from '@/tools/agent-builder/ExecutionRuntime';
import type {
  GetAgentConfigParams,
  GetAgentMetaParams,
  GetAvailableModelsParams,
  GetAvailableToolsParams,
  GetPromptParams,
  SetModelParams,
  SetOpeningMessageParams,
  SetOpeningQuestionsParams,
  TogglePluginParams,
  UpdateAgentConfigParams,
  UpdateAgentMetaParams,
  UpdateChatConfigParams,
  UpdatePromptParams,
} from '@/tools/agent-builder/types';

const log = debug('lobe-store:builtin-tool:agent-builder');

export interface AgentBuilderAction {
  agentBuilder_getAvailableModels: (
    id: string,
    params: GetAvailableModelsParams,
  ) => Promise<boolean>;
  agentBuilder_getAvailableTools: (id: string, params: GetAvailableToolsParams) => Promise<boolean>;
  agentBuilder_getConfig: (id: string, params: GetAgentConfigParams) => Promise<boolean>;
  agentBuilder_getMeta: (id: string, params: GetAgentMetaParams) => Promise<boolean>;
  agentBuilder_getPrompt: (id: string, params: GetPromptParams) => Promise<boolean>;
  agentBuilder_setModel: (id: string, params: SetModelParams) => Promise<boolean>;
  agentBuilder_setOpeningMessage: (id: string, params: SetOpeningMessageParams) => Promise<boolean>;
  agentBuilder_setOpeningQuestions: (
    id: string,
    params: SetOpeningQuestionsParams,
  ) => Promise<boolean>;
  agentBuilder_togglePlugin: (id: string, params: TogglePluginParams) => Promise<boolean>;
  agentBuilder_updateChatConfig: (id: string, params: UpdateChatConfigParams) => Promise<boolean>;
  agentBuilder_updateConfig: (id: string, params: UpdateAgentConfigParams) => Promise<boolean>;
  agentBuilder_updateMeta: (id: string, params: UpdateAgentMetaParams) => Promise<boolean>;
  agentBuilder_updatePrompt: (id: string, params: UpdatePromptParams) => Promise<boolean>;
  internal_triggerAgentBuilderToolCalling: (
    id: string,
    apiName: string,
    params: any,
  ) => Promise<boolean>;
}

const runtime = new AgentBuilderExecutionRuntime();

export const agentBuilderSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  AgentBuilderAction
> = (set, get) => ({
  // ==================== Read Operations ====================

  agentBuilder_getAvailableModels: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'getAvailableModels', params);
  },

  agentBuilder_getAvailableTools: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'getAvailableTools', params);
  },

  agentBuilder_getConfig: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'getAgentConfig', params);
  },

  agentBuilder_getMeta: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'getAgentMeta', params);
  },

  agentBuilder_getPrompt: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'getPrompt', params);
  },

  agentBuilder_setModel: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'setModel', params);
  },

  agentBuilder_setOpeningMessage: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'setOpeningMessage', params);
  },

  agentBuilder_setOpeningQuestions: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'setOpeningQuestions', params);
  },

  // ==================== Specific Field Operations ====================
  agentBuilder_togglePlugin: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'togglePlugin', params);
  },

  agentBuilder_updateChatConfig: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'updateChatConfig', params);
  },

  // ==================== Write Operations ====================
  agentBuilder_updateConfig: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'updateAgentConfig', params);
  },

  agentBuilder_updateMeta: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'updateAgentMeta', params);
  },

  agentBuilder_updatePrompt: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, 'updatePrompt', params);
  },

  // ==================== Internal Helper ====================

  /**
   * Internal helper to execute agent builder tool calling operations
   * Handles operation tracking, error handling, and state updates
   */
  internal_triggerAgentBuilderToolCalling: async (id, apiName, params) => {
    // Get parent operationId from messageOperationMap (should be executeToolCall)
    const parentOperationId = get().messageOperationMap[id];

    // Create child operation for agent builder execution
    // Auto-associates message with this operation via messageId in context
    const { operationId, abortController } = get().startOperation({
      context: {
        messageId: id,
      },
      metadata: {
        apiName,
        params,
        startTime: Date.now(),
      },
      parentOperationId,
      type: 'builtinToolAgentBuilder',
    });

    log(
      '[%s] messageId=%s, parentOpId=%s, opId=%s, aborted=%s',
      apiName,
      id,
      parentOperationId,
      operationId,
      abortController.signal.aborted,
    );

    const context = { operationId };

    try {
      const agentId = get().activeAgentId;

      if (!agentId) {
        throw new Error('No active agent found');
      }

      // Execute the runtime method
      let result;
      switch (apiName) {
        case 'getAgentConfig': {
          // Pass agentId to read operation for agent-specific config
          result = await runtime.getAgentConfig(agentId, params as GetAgentConfigParams);
          break;
        }
        case 'getAgentMeta': {
          // Pass agentId to read operation for agent-specific meta
          result = await runtime.getAgentMeta(agentId, params as GetAgentMetaParams);
          break;
        }
        case 'updateAgentConfig': {
          result = await runtime.updateAgentConfig(agentId, params as UpdateAgentConfigParams);
          break;
        }
        case 'updateAgentMeta': {
          result = await runtime.updateAgentMeta(agentId, params as UpdateAgentMetaParams);
          break;
        }
        case 'updateChatConfig': {
          result = await runtime.updateChatConfig(agentId, params as UpdateChatConfigParams);
          break;
        }
        case 'togglePlugin': {
          result = await runtime.togglePlugin(agentId, params as TogglePluginParams);
          break;
        }
        case 'setModel': {
          result = await runtime.setModel(agentId, params as SetModelParams);
          break;
        }
        case 'setOpeningMessage': {
          result = await runtime.setOpeningMessage(agentId, params as SetOpeningMessageParams);
          break;
        }
        case 'setOpeningQuestions': {
          result = await runtime.setOpeningQuestions(agentId, params as SetOpeningQuestionsParams);
          break;
        }
        case 'getAvailableModels': {
          result = await runtime.getAvailableModels(params as GetAvailableModelsParams);
          break;
        }
        case 'getAvailableTools': {
          result = await runtime.getAvailableTools(params as GetAvailableToolsParams);
          break;
        }
        case 'getPrompt': {
          result = await runtime.getPrompt(agentId, params as GetPromptParams);
          break;
        }
        case 'updatePrompt': {
          result = await runtime.updatePrompt(agentId, {
            streaming: true,
            ...params
          } as UpdatePromptParams);
          break;
        }
        default: {
          throw new Error(`Unknown API name: ${apiName}`);
        }
      }

      const { content, success, error, state } = result;

      // Complete operation
      get().completeOperation(operationId);

      // Update message content
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        // Update plugin state with the result
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        // Update plugin error
        await get().optimisticUpdatePluginError(id, error, context);
      }

      return true;
    } catch (error) {
      const err = error as Error;

      log('[%s] Error: messageId=%s, error=%s', apiName, id, err.message);

      // Check if it's an abort error
      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        log('[%s] Request aborted: messageId=%s', apiName, id);
        // Fail operation for abort
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        // Don't update error message for user aborts
        return true;
      }

      // Fail operation for other errors
      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      // For other errors, update message
      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },
});
