import { BuiltinServerRuntimeOutput } from '@lobechat/types';

import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors/selectors';
import { getAiInfraStoreState } from '@/store/aiInfra';
import { getToolStoreState } from '@/store/tool';
import { builtinToolSelectors } from '@/store/tool/slices/builtin/selectors';
import { pluginSelectors } from '@/store/tool/slices/plugin/selectors';

import type {
  AvailableModel,
  AvailableProvider,
  AvailableTool,
  GetAgentConfigParams,
  GetAgentMetaParams,
  GetAvailableModelsParams,
  GetAvailableModelsState,
  GetAvailableToolsParams,
  GetAvailableToolsState,
  GetConfigState,
  GetMetaState,
  GetPromptParams,
  GetPromptState,
  SetModelParams,
  SetModelState,
  SetOpeningMessageParams,
  SetOpeningMessageState,
  SetOpeningQuestionsParams,
  SetOpeningQuestionsState,
  TogglePluginParams,
  TogglePluginState,
  UpdateAgentConfigParams,
  UpdateAgentMetaParams,
  UpdateChatConfigParams,
  UpdateConfigState,
  UpdateMetaState,
  UpdatePromptParams,
  UpdatePromptState,
} from '../types';

/**
 * Agent Builder Execution Runtime
 * Handles the execution logic for all Agent Builder APIs
 */
export class AgentBuilderExecutionRuntime {
  // ==================== Read Operations ====================

  /**
   * Get agent configuration
   */
  async getAgentConfig(
    agentId: string,
    args: GetAgentConfigParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent config instead of currentAgentConfig
      const config = agentSelectors.getAgentConfigById(agentId)(state);

      // If specific fields are requested, filter the config
      let filteredConfig = config;
      if (args.fields && args.fields.length > 0) {
        filteredConfig = Object.fromEntries(
          Object.entries(config).filter(([key]) => args.fields!.includes(key)),
        ) as typeof config;
      }

      const content = `Current agent configuration:\n${JSON.stringify(filteredConfig, null, 2)}`;

      return {
        content,
        state: { config: filteredConfig } as GetConfigState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to get agent config: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  /**
   * Get agent metadata
   */
  async getAgentMeta(
    agentId: string,
    args: GetAgentMetaParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent meta instead of currentAgentMeta
      const meta = agentSelectors.getAgentMetaById(agentId)(state);

      // If specific fields are requested, filter the meta
      let filteredMeta = meta;
      if (args.fields && args.fields.length > 0) {
        filteredMeta = Object.fromEntries(
          Object.entries(meta).filter(([key]) => args.fields!.includes(key)),
        ) as typeof meta;
      }

      const content = `Current agent metadata:\n${JSON.stringify(filteredMeta, null, 2)}`;

      return {
        content,
        state: { meta: filteredMeta } as GetMetaState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to get agent meta: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  /**
   * Get available models and providers
   */
  async getAvailableModels(args: GetAvailableModelsParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const aiInfraState = getAiInfraStoreState();
      const enabledList = aiInfraState.enabledChatModelList || [];

      // Filter by providerId if specified
      const filteredList = args.providerId
        ? enabledList.filter((p) => p.id === args.providerId)
        : enabledList;

      // Transform to our response format
      const providers: AvailableProvider[] = filteredList.map((provider) => ({
        id: provider.id,
        models: provider.children.map(
          (model): AvailableModel => ({
            abilities: model.abilities
              ? {
                  files: model.abilities.files,
                  functionCall: model.abilities.functionCall,
                  reasoning: model.abilities.reasoning,
                  vision: model.abilities.vision,
                }
              : undefined,
            description: model.description,
            id: model.id,
            name: model.displayName || model.id,
          }),
        ),
        name: provider.name,
      }));

      const totalModels = providers.reduce((sum, p) => sum + p.models.length, 0);
      const content = `Found ${providers.length} provider(s) with ${totalModels} model(s) available.`;

      return {
        content,
        state: { providers } as GetAvailableModelsState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to get available models: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  /**
   * Get available tools (plugins and built-in tools)
   */
  async getAvailableTools(args: GetAvailableToolsParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const toolState = getToolStoreState();
      const filterType = args.type || 'all';

      const tools: AvailableTool[] = [];

      // Get builtin tools
      if (filterType === 'all' || filterType === 'builtin') {
        const builtinTools = builtinToolSelectors.metaList(toolState);
        for (const tool of builtinTools) {
          tools.push({
            author: tool.author,
            description: tool.meta?.description,
            identifier: tool.identifier,
            title: tool.meta?.title || tool.identifier,
            type: 'builtin',
          });
        }
      }

      // Get installed plugins
      if (filterType === 'all' || filterType === 'plugin') {
        const installedPlugins = pluginSelectors.installedPluginMetaList(toolState);
        for (const plugin of installedPlugins) {
          tools.push({
            author: plugin.author,
            description: plugin.description,
            identifier: plugin.identifier,
            title: plugin.title || plugin.identifier,
            type: 'plugin',
          });
        }
      }

      const content = `Found ${tools.length} available tool(s).`;

      return {
        content,
        state: { tools } as GetAvailableToolsState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to get available tools: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  /**
   * Get agent system prompt
   */
  async getPrompt(agentId: string, args: GetPromptParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      const config = agentSelectors.getAgentConfigById(agentId)(state);
      const prompt = config.systemRole || '';

      // If preview mode, truncate the prompt
      let displayPrompt = prompt;
      if (args.preview && prompt.length > 500) {
        displayPrompt = prompt.slice(0, 500) + '...';
      }

      const content = prompt
        ? `Current system prompt (${prompt.length} characters):\n\n${displayPrompt}`
        : 'No system prompt is currently set.';

      return {
        content,
        state: { prompt } as GetPromptState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to get prompt: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Write Operations ====================

  /**
   * Update agent configuration (bulk update)
   */
  async updateAgentConfig(
    agentId: string,
    args: UpdateAgentConfigParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent config instead of currentAgentConfig
      const previousConfig = agentSelectors.getAgentConfigById(agentId)(state);

      // Extract the fields that will be updated
      const updatedFields = Object.keys(args.config);
      const previousValues: Record<string, unknown> = {};
      const newValues: Record<string, unknown> = {};

      for (const field of updatedFields) {
        previousValues[field] = (previousConfig as unknown as Record<string, unknown>)[field];
        newValues[field] = (args.config as unknown as Record<string, unknown>)[field];
      }

      // Call the store action to update
      await getAgentStoreState().optimisticUpdateAgentConfig(agentId, args.config);

      const content = `Successfully updated agent configuration. Updated fields: ${updatedFields.join(', ')}`;

      return {
        content,
        state: {
          newValues,
          previousValues,
          success: true,
          updatedFields,
        } as UpdateConfigState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to update agent config: ${err.message}`,
        error,
        state: {
          newValues: {},
          previousValues: {},
          success: false,
          updatedFields: [],
        } as UpdateConfigState,
        success: false,
      };
    }
  }

  /**
   * Update agent metadata
   */
  async updateAgentMeta(
    agentId: string,
    args: UpdateAgentMetaParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent meta instead of currentAgentMeta
      const previousMeta = agentSelectors.getAgentMetaById(agentId)(state);

      // Extract the fields that will be updated
      const updatedFields = Object.keys(args.meta);
      const previousValues: Record<string, unknown> = {};
      const newValues = args.meta;

      for (const field of updatedFields) {
        previousValues[field] = (previousMeta as unknown as Record<string, unknown>)[field];
      }

      // Call the store action to update
      await getAgentStoreState().optimisticUpdateAgentMeta(agentId, args.meta);

      const content = `Successfully updated agent metadata. Updated fields: ${updatedFields.join(', ')}`;

      return {
        content,
        state: {
          newValues,
          previousValues,
          success: true,
          updatedFields,
        } as UpdateMetaState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to update agent meta: ${err.message}`,
        error,
        state: {
          newValues: {},
          previousValues: {},
          success: false,
          updatedFields: [],
        } as UpdateMetaState,
        success: false,
      };
    }
  }

  /**
   * Update chat configuration
   */
  async updateChatConfig(
    agentId: string,
    args: UpdateChatConfigParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent config instead of currentAgentConfig
      const previousConfig = agentSelectors.getAgentConfigById(agentId)(state);
      const previousChatConfig = previousConfig.chatConfig || {};

      // Extract the fields that will be updated
      const updatedFields = Object.keys(args.chatConfig);
      const previousValues: Record<string, unknown> = {};
      const newValues: Record<string, unknown> = {};

      for (const field of updatedFields) {
        previousValues[field] = (previousChatConfig as unknown as Record<string, unknown>)[field];
        newValues[field] = (args.chatConfig as unknown as Record<string, unknown>)[field];
      }

      // Call the store action to update (wrapping chatConfig inside config)
      await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
        chatConfig: args.chatConfig,
      });

      const content = `Successfully updated chat configuration. Updated fields: ${updatedFields.join(', ')}`;

      return {
        content,
        state: {
          newValues,
          previousValues,
          success: true,
          updatedFields,
        } as UpdateConfigState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to update chat config: ${err.message}`,
        error,
        state: {
          newValues: {},
          previousValues: {},
          success: false,
          updatedFields: [],
        } as UpdateConfigState,
        success: false,
      };
    }
  }

  // ==================== Specific Field Operations ====================

  /**
   * Toggle plugin (enable/disable)
   */
  async togglePlugin(
    agentId: string,
    args: TogglePluginParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent plugins instead of currentAgentPlugins
      const config = agentSelectors.getAgentConfigById(agentId)(state);
      const currentPlugins = config.plugins || [];

      const isCurrentlyEnabled = currentPlugins.includes(args.pluginId);
      const shouldEnable = args.enabled !== undefined ? args.enabled : !isCurrentlyEnabled;

      let newPlugins: string[];
      if (shouldEnable && !isCurrentlyEnabled) {
        // Enable: add plugin
        newPlugins = [...currentPlugins, args.pluginId];
      } else if (!shouldEnable && isCurrentlyEnabled) {
        // Disable: remove plugin
        newPlugins = currentPlugins.filter((id) => id !== args.pluginId);
      } else {
        // No change needed
        newPlugins = currentPlugins;
      }

      // Update the plugins array
      await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
        plugins: newPlugins,
      });

      const action = shouldEnable ? 'enabled' : 'disabled';
      const content = `Successfully ${action} plugin: ${args.pluginId}`;

      return {
        content,
        state: {
          enabled: shouldEnable,
          pluginId: args.pluginId,
          success: true,
        } as TogglePluginState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to toggle plugin: ${err.message}`,
        error,
        state: {
          enabled: false,
          pluginId: args.pluginId,
          success: false,
        } as TogglePluginState,
        success: false,
      };
    }
  }

  /**
   * Set model and provider
   */
  async setModel(agentId: string, args: SetModelParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent config instead of currentAgentModel/currentAgentModelProvider
      const config = agentSelectors.getAgentConfigById(agentId)(state);
      const previousModel = config.model;
      const previousProvider = config.provider;

      // Update model and provider
      await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
        model: args.model,
        provider: args.provider,
      });

      const content = `Successfully set model to ${args.model} (provider: ${args.provider})`;

      return {
        content,
        state: {
          model: args.model,
          previousModel,
          previousProvider,
          provider: args.provider,
          success: true,
        } as SetModelState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to set model: ${err.message}`,
        error,
        state: {
          model: args.model,
          provider: args.provider,
          success: false,
        } as SetModelState,
        success: false,
      };
    }
  }

  /**
   * Set opening message
   */
  async setOpeningMessage(
    agentId: string,
    args: SetOpeningMessageParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent config instead of currentAgentConfig
      const previousConfig = agentSelectors.getAgentConfigById(agentId)(state);
      const previousMessage = previousConfig.openingMessage;

      // Update opening message
      await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
        openingMessage: args.message,
      });

      const content = args.message
        ? `Successfully set opening message: "${args.message}"`
        : 'Successfully removed opening message';

      return {
        content,
        state: {
          message: args.message,
          previousMessage,
          success: true,
        } as SetOpeningMessageState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to set opening message: ${err.message}`,
        error,
        state: {
          message: args.message,
          success: false,
        } as SetOpeningMessageState,
        success: false,
      };
    }
  }

  /**
   * Set opening questions
   */
  async setOpeningQuestions(
    agentId: string,
    args: SetOpeningQuestionsParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      // Use agentId to get agent config instead of currentAgentConfig
      const previousConfig = agentSelectors.getAgentConfigById(agentId)(state);
      const previousQuestions = previousConfig.openingQuestions;

      // Update opening questions
      await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
        openingQuestions: args.questions,
      });

      const content =
        args.questions.length > 0
          ? `Successfully set ${args.questions.length} opening questions`
          : 'Successfully removed all opening questions';

      return {
        content,
        state: {
          previousQuestions,
          questions: args.questions,
          success: true,
        } as SetOpeningQuestionsState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to set opening questions: ${err.message}`,
        error,
        state: {
          questions: args.questions,
          success: false,
        } as SetOpeningQuestionsState,
        success: false,
      };
    }
  }

  /**
   * Update agent system prompt
   */
  async updatePrompt(
    agentId: string,
    args: UpdatePromptParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const state = getAgentStoreState();
      const previousConfig = agentSelectors.getAgentConfigById(agentId)(state);
      const previousPrompt = previousConfig.systemRole;

      if (args.streaming) {
        // Use streaming mode for typewriter effect
        await this.streamUpdatePrompt(agentId, args.prompt);
      } else {
        // Update the system prompt directly
        await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
          systemRole: args.prompt,
        });
      }

      const content = args.prompt
        ? `Successfully updated system prompt (${args.prompt.length} characters)`
        : 'Successfully cleared system prompt';

      return {
        content,
        state: {
          newPrompt: args.prompt,
          previousPrompt,
          success: true,
        } as UpdatePromptState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to update prompt: ${err.message}`,
        error,
        state: {
          newPrompt: args.prompt,
          success: false,
        } as UpdatePromptState,
        success: false,
      };
    }
  }

  /**
   * Stream update prompt with typewriter effect
   */
  private async streamUpdatePrompt(agentId: string, prompt: string): Promise<void> {
    const agentStore = getAgentStoreState();

    // Start streaming
    agentStore.startStreamingSystemRole();

    // Simulate streaming by chunking the content
    const chunkSize = 5; // Characters per chunk
    const delay = 10; // Milliseconds between chunks

    for (let i = 0; i < prompt.length; i += chunkSize) {
      const chunk = prompt.slice(i, i + chunkSize);
      agentStore.appendStreamingSystemRole(chunk);

      // Small delay for typewriter effect
      if (i + chunkSize < prompt.length) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Finish streaming and save
    await agentStore.finishStreamingSystemRole(agentId);
  }
}
