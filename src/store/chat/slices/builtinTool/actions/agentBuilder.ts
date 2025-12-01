import debug from 'debug';
import { StateCreator } from 'zustand/vanilla';

import { agentSelectors } from '@/store/agent/selectors';
import { getAgentStoreState, useAgentStore } from '@/store/agent/store';
import { ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import {
  AgentBuilderExecutionRuntime,
  AgentBuilderRuntimeOptions,
} from '@/tools/agent-builder/ExecutionRuntime';
import {
  AddKnowledgeBaseParams,
  CreateAgentParams,
  DisableToolParams,
  EnableToolParams,
  GetAgentInfoParams,
  ListAvailableModelsParams,
  ListAvailableToolsParams,
  RemoveKnowledgeBaseParams,
  UpdateAgentMetaParams,
  UpdateChatConfigParams,
  UpdateModelConfigParams,
  UpdateOpeningConfigParams,
  UpdateSystemRoleParams,
} from '@/tools/agent-builder/type';

const log = debug('lobe-store:builtin-tool:agent-builder');

/* eslint-disable typescript-sort-keys/interface */
export interface AgentBuilderAction {
  internal_triggerAgentBuilderToolCalling: (
    id: string,
    callingService: () => Promise<{ content: string; error?: any; state?: any; success: boolean }>,
  ) => Promise<boolean>;

  // Query APIs
  getAgentInfo: (id: string, params: GetAgentInfoParams) => Promise<boolean>;
  listAvailableTools: (id: string, params: ListAvailableToolsParams) => Promise<boolean>;
  listAvailableModels: (id: string, params: ListAvailableModelsParams) => Promise<boolean>;

  // Create/Update APIs
  createAgent: (id: string, params: CreateAgentParams) => Promise<boolean>;
  updateAgentMeta: (id: string, params: UpdateAgentMetaParams) => Promise<boolean>;
  updateSystemRole: (id: string, params: UpdateSystemRoleParams) => Promise<boolean>;
  updateModelConfig: (id: string, params: UpdateModelConfigParams) => Promise<boolean>;

  // Tool Configuration APIs
  enableTool: (id: string, params: EnableToolParams) => Promise<boolean>;
  disableTool: (id: string, params: DisableToolParams) => Promise<boolean>;

  // Knowledge Base APIs
  addKnowledgeBase: (id: string, params: AddKnowledgeBaseParams) => Promise<boolean>;
  removeKnowledgeBase: (id: string, params: RemoveKnowledgeBaseParams) => Promise<boolean>;

  // Advanced Configuration APIs
  updateChatConfig: (id: string, params: UpdateChatConfigParams) => Promise<boolean>;
  updateOpeningConfig: (id: string, params: UpdateOpeningConfigParams) => Promise<boolean>;
}
/* eslint-enable typescript-sort-keys/interface */

/**
 * Create an AgentBuilderExecutionRuntime with current agent store context
 */
const createRuntime = (): AgentBuilderExecutionRuntime => {
  const agentState = getAgentStoreState();
  const agentId = agentState.activeAgentId || '';

  const options: AgentBuilderRuntimeOptions = {
    agentId,
    getAgentConfig: () => agentSelectors.currentAgentConfig(getAgentStoreState()),
    getInstalledPlugins: () => {
      const toolState = useToolStore.getState();
      return toolState.installedPlugins || [];
    },
    updateAgentConfig: async (config) => {
      await useAgentStore.getState().updateAgentConfig(config);
    },
    updateAgentMeta: async (meta) => {
      await useAgentStore.getState().updateAgentMeta(meta);
    },
  };

  return new AgentBuilderExecutionRuntime(options);
};

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const agentBuilderSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  AgentBuilderAction
> = (set, get) => ({
  // ==================== Query APIs ====================

  getAgentInfo: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.getAgentInfo(params);
    });
  },

  listAvailableTools: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.listAvailableTools(params);
    });
  },

  listAvailableModels: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.listAvailableModels(params);
    });
  },

  // ==================== Create/Update APIs ====================

  createAgent: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.createAgent(params);
    });
  },

  updateAgentMeta: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.updateAgentMeta(params);
    });
  },

  updateSystemRole: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.updateSystemRole(params);
    });
  },

  updateModelConfig: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.updateModelConfig(params);
    });
  },

  // ==================== Tool Configuration APIs ====================

  enableTool: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.enableTool(params);
    });
  },

  disableTool: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.disableTool(params);
    });
  },

  // ==================== Knowledge Base APIs ====================

  addKnowledgeBase: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.addKnowledgeBase(params);
    });
  },

  removeKnowledgeBase: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.removeKnowledgeBase(params);
    });
  },

  // ==================== Advanced Configuration APIs ====================

  updateChatConfig: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.updateChatConfig(params);
    });
  },

  updateOpeningConfig: async (id, params) => {
    return get().internal_triggerAgentBuilderToolCalling(id, async () => {
      const runtime = createRuntime();
      return await runtime.updateOpeningConfig(params);
    });
  },

  // ==================== Internal Utils ====================

  internal_triggerAgentBuilderToolCalling: async (id, callingService) => {
    // Get parent operationId from messageOperationMap (should be executeToolCall)
    const parentOperationId = get().messageOperationMap[id];

    // Create child operation for agent builder execution
    const { operationId: agentBuilderOpId, abortController } = get().startOperation({
      context: {
        messageId: id,
      },
      metadata: {
        startTime: Date.now(),
      },
      parentOperationId,
      type: 'builtinToolAgentBuilder',
    });

    log(
      '[agentBuilder] messageId=%s, parentOpId=%s, agentBuilderOpId=%s, aborted=%s',
      id,
      parentOperationId,
      agentBuilderOpId,
      abortController.signal.aborted,
    );

    const context = { operationId: agentBuilderOpId };

    try {
      const { state, content, success, error } = await callingService();

      // Complete agent builder operation
      get().completeOperation(agentBuilderOpId);

      if (success) {
        if (state) {
          await get().optimisticUpdatePluginState(id, state, context);
        }
        await get().optimisticUpdateMessageContent(id, content, undefined, context);
      } else {
        await get().optimisticUpdateMessagePluginError(
          id,
          {
            body: error,
            message: error?.message || 'Operation failed',
            type: 'PluginServerError',
          },
          context,
        );
        // Still update content even if failed, to show error message
        await get().optimisticUpdateMessageContent(id, content, undefined, context);
      }

      return true;
    } catch (error) {
      const err = error as Error;

      log('[agentBuilder] Error: messageId=%s, error=%s', id, err.message);

      // Check if it's an abort error
      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        log('[agentBuilder] Request aborted: messageId=%s', id);
        // Fail agent builder operation for abort
        get().failOperation(agentBuilderOpId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        // Don't update error message for user aborts
        return false;
      }

      // Fail agent builder operation for other errors
      get().failOperation(agentBuilderOpId, {
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

      return false;
    }
  },
});
