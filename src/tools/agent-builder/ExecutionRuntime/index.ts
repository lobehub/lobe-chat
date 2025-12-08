import { KLAVIS_SERVER_TYPES } from '@lobechat/const';
import {
  marketToolsResultsPrompt,
  modelsResultsPrompt,
  officialToolsResultsPrompt,
} from '@lobechat/prompts';
import { BuiltinServerRuntimeOutput } from '@lobechat/types';

import { discoverService } from '@/services/discover';
import { getAgentStoreState } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors/selectors';
import { getAiInfraStoreState } from '@/store/aiInfra';
import { getToolStoreState } from '@/store/tool';
import {
  builtinToolSelectors,
  klavisStoreSelectors,
  pluginSelectors,
} from '@/store/tool/selectors';
import { KlavisServerStatus } from '@/store/tool/slices/klavisStore/types';

import type {
  AvailableModel,
  AvailableProvider,
  GetAvailableModelsParams,
  GetAvailableModelsState,
  InstallPluginParams,
  InstallPluginState,
  MarketToolItem,
  OfficialToolItem,
  SearchMarketToolsParams,
  SearchMarketToolsState,
  SearchOfficialToolsParams,
  SearchOfficialToolsState,
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
 *
 * Note: getAgentConfig, getAgentMeta, getPrompt, getAvailableTools are removed
 * because the current agent context is now automatically injected into the conversation
 */
export class AgentBuilderExecutionRuntime {
  // ==================== Read Operations ====================

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

      // Convert to XML format to provide detailed model list to agent
      const xmlContent = modelsResultsPrompt(providers);
      const summary = `Found ${providers.length} provider(s) with ${totalModels} model(s) available.\n\n${xmlContent}`;

      return {
        content: summary,
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
   * Search for tools in the marketplace
   */
  async searchMarketTools(args: SearchMarketToolsParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const toolState = getToolStoreState();

      // Fetch from market
      const response = await discoverService.getMcpList({
        category: args.category,
        pageSize: args.pageSize || 10,
        q: args.query,
      });

      // Transform to our format and check installation status
      const tools: MarketToolItem[] = response.items.map((item) => {
        const installed = pluginSelectors.isPluginInstalled(item.identifier)(toolState);
        return {
          author: item.author,
          cloudEndPoint: (item as any).cloudEndPoint,
          description: item.description,
          haveCloudEndpoint: (item as any).haveCloudEndpoint,
          icon: item.icon,
          identifier: item.identifier,
          installed,
          name: item.name,
          tags: item.tags,
        };
      });

      const installedCount = tools.filter((t) => t.installed).length;
      const notInstalledCount = tools.length - installedCount;

      let summary = `Found ${response.totalCount} tool(s) in the marketplace.`;
      if (args.query) {
        summary = `Found ${response.totalCount} tool(s) matching "${args.query}".`;
      }
      if (installedCount > 0) {
        summary += ` ${installedCount} already installed, ${notInstalledCount} available to install.`;
      }

      // Convert to XML format to provide detailed tool list to agent
      const xmlContent = marketToolsResultsPrompt(tools);
      const content = `${summary}\n\n${xmlContent}`;

      return {
        content,
        state: {
          query: args.query,
          tools,
          totalCount: response.totalCount,
        } as SearchMarketToolsState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to search market tools: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  /**
   * Search for official tools (builtin tools and Klavis MCP servers)
   */
  async searchOfficialTools(
    agentId: string,
    args: SearchOfficialToolsParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const toolState = getToolStoreState();
      const agentState = getAgentStoreState();
      const filterType = args.type || 'all';
      const query = args.query?.toLowerCase();

      // Check if Klavis is enabled via global store
      const isKlavisEnabled =
        typeof window !== 'undefined' &&
        window.global_serverConfigStore?.getState()?.serverConfig?.enableKlavis;

      // Get current agent's enabled plugins
      const enabledPlugins = agentSelectors.getAgentConfigById(agentId)(agentState).plugins || [];

      const tools: OfficialToolItem[] = [];

      // Get builtin tools
      if (filterType === 'all' || filterType === 'builtin') {
        const builtinTools = builtinToolSelectors.metaList(toolState);

        // Get all Klavis identifiers to filter them out from builtin list
        const klavisIdentifiers = new Set(KLAVIS_SERVER_TYPES.map((t) => t.identifier));

        for (const tool of builtinTools) {
          // Skip Klavis tools in builtin list (they'll be shown separately)
          if (klavisIdentifiers.has(tool.identifier)) continue;

          // Apply search filter
          if (query) {
            const searchText =
              `${tool.meta?.title || ''} ${tool.meta?.description || ''} ${tool.identifier}`.toLowerCase();
            if (!searchText.includes(query)) continue;
          }

          tools.push({
            author: tool.author,
            description: tool.meta?.description,
            enabled: enabledPlugins.includes(tool.identifier),
            icon: tool.meta?.avatar,
            identifier: tool.identifier,
            installed: true, // Builtin tools are always installed
            name: tool.meta?.title || tool.identifier,
            type: 'builtin',
          });
        }
      }

      // Get Klavis tools
      if (isKlavisEnabled && (filterType === 'all' || filterType === 'klavis')) {
        const allKlavisServers = klavisStoreSelectors.getServers(toolState);

        for (const klavisType of KLAVIS_SERVER_TYPES) {
          // Apply search filter
          if (query) {
            const searchText = `${klavisType.label} ${klavisType.identifier}`.toLowerCase();
            if (!searchText.includes(query)) continue;
          }

          // Find connected server if exists
          const server = allKlavisServers.find((s) => s.identifier === klavisType.identifier);

          // Determine status
          let status: 'connected' | 'pending_auth' | 'error' | undefined;
          if (server) {
            switch (server.status) {
              case KlavisServerStatus.CONNECTED: {
                status = 'connected';
                break;
              }
              case KlavisServerStatus.PENDING_AUTH: {
                status = 'pending_auth';
                break;
              }
              case KlavisServerStatus.ERROR: {
                status = 'error';
                break;
              }
            }
          }

          tools.push({
            author: 'Klavis',
            description: `Klavis MCP Server: ${klavisType.label}`,
            enabled: enabledPlugins.includes(klavisType.identifier),
            icon: typeof klavisType.icon === 'string' ? klavisType.icon : undefined,
            identifier: klavisType.identifier,
            installed: !!server,
            name: klavisType.label,
            oauthUrl: server?.oauthUrl,
            serverName: klavisType.serverName,
            status,
            type: 'klavis',
          });
        }
      }

      const enabledCount = tools.filter((t) => t.enabled).length;
      const installedCount = tools.filter((t) => t.installed).length;

      let summary = `Found ${tools.length} official tool(s).`;
      if (query) {
        summary = `Found ${tools.length} official tool(s) matching "${args.query}".`;
      }
      summary += ` ${installedCount} installed, ${enabledCount} enabled.`;

      if (isKlavisEnabled) {
        summary += ' Klavis integrations are available.';
      }

      // Convert to XML format to provide detailed tool list to agent
      const xmlContent = officialToolsResultsPrompt(tools);
      const content = `${summary}\n\n${xmlContent}`;

      return {
        content,
        state: {
          klavisEnabled: isKlavisEnabled,
          query: args.query,
          tools,
          totalCount: tools.length,
        } as SearchOfficialToolsState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to search official tools: ${err.message}`,
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

  // ==================== Plugin Installation ====================

  /**
   * Install a plugin (MCP marketplace or Klavis/Builtin)
   * This method prepares the installation state but requires user approval
   * to actually perform the installation.
   */
  async installPlugin(
    agentId: string,
    args: InstallPluginParams,
  ): Promise<BuiltinServerRuntimeOutput> {
    const { identifier, source } = args;

    try {
      const toolState = getToolStoreState();

      if (source === 'official') {
        // Check if it's a Klavis tool
        const isKlavisEnabled =
          typeof window !== 'undefined' &&
          window.global_serverConfigStore?.getState()?.serverConfig?.enableKlavis;

        if (isKlavisEnabled) {
          // Check if this is a Klavis tool
          const klavisServer = klavisStoreSelectors
            .getServers(toolState)
            .find((s) => s.identifier === identifier);

          // Find Klavis tool info from KLAVIS_SERVER_TYPES
          const klavisTypeInfo = KLAVIS_SERVER_TYPES.find((t) => t.identifier === identifier);

          if (klavisTypeInfo) {
            // This is a Klavis tool
            if (klavisServer) {
              // Server exists
              if (klavisServer.status === KlavisServerStatus.CONNECTED) {
                // Already connected, just enable the plugin
                const agentState = getAgentStoreState();
                const currentPlugins =
                  agentSelectors.getAgentConfigById(agentId)(agentState).plugins || [];

                if (!currentPlugins.includes(identifier)) {
                  await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
                    plugins: [...currentPlugins, identifier],
                  });
                }

                return {
                  content: `Successfully enabled Klavis tool: ${klavisTypeInfo.label}`,
                  state: {
                    installed: true,
                    isKlavis: true,
                    pluginId: identifier,
                    pluginName: klavisTypeInfo.label,
                    serverStatus: 'connected',
                    success: true,
                  } as InstallPluginState,
                  success: true,
                };
              } else if (klavisServer.status === KlavisServerStatus.PENDING_AUTH) {
                // Needs OAuth authorization - return state requiring user approval
                return {
                  content: `Klavis tool "${klavisTypeInfo.label}" requires OAuth authorization. Please complete the authorization in the UI below.`,
                  state: {
                    awaitingApproval: true,
                    installed: false,
                    isKlavis: true,
                    oauthUrl: klavisServer.oauthUrl,
                    pluginId: identifier,
                    pluginName: klavisTypeInfo.label,
                    serverName: klavisTypeInfo.serverName,
                    serverStatus: 'pending_auth',
                    success: true,
                  } as InstallPluginState,
                  success: true,
                };
              }
            } else {
              // Server doesn't exist yet, return state for creating and connecting
              return {
                content: `Klavis tool "${klavisTypeInfo.label}" needs to be connected. Please approve to connect and authorize.`,
                state: {
                  awaitingApproval: true,
                  installed: false,
                  isKlavis: true,
                  pluginId: identifier,
                  pluginName: klavisTypeInfo.label,
                  serverName: klavisTypeInfo.serverName,
                  success: true,
                } as InstallPluginState,
                success: true,
              };
            }
          }
        }

        // Not a Klavis tool, check if it's a builtin tool
        const builtinTools = builtinToolSelectors.metaList(toolState);
        const builtinTool = builtinTools.find((t) => t.identifier === identifier);

        if (builtinTool) {
          // It's a builtin tool, just enable it
          const agentState = getAgentStoreState();
          const currentPlugins =
            agentSelectors.getAgentConfigById(agentId)(agentState).plugins || [];

          if (!currentPlugins.includes(identifier)) {
            await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
              plugins: [...currentPlugins, identifier],
            });
          }

          return {
            content: `Successfully enabled builtin tool: ${builtinTool.meta?.title || identifier}`,
            state: {
              installed: true,
              pluginId: identifier,
              pluginName: builtinTool.meta?.title || identifier,
              success: true,
            } as InstallPluginState,
            success: true,
          };
        }

        return {
          content: `Official tool "${identifier}" not found.`,
          error: 'Tool not found',
          state: {
            installed: false,
            pluginId: identifier,
            success: false,
          } as InstallPluginState,
          success: false,
        };
      }

      // Source is 'market' - MCP marketplace plugin
      // Check if already installed
      const isInstalled = pluginSelectors.isPluginInstalled(identifier)(toolState);

      if (isInstalled) {
        // Already installed, just enable it for the agent
        const agentState = getAgentStoreState();
        const currentPlugins = agentSelectors.getAgentConfigById(agentId)(agentState).plugins || [];

        if (!currentPlugins.includes(identifier)) {
          await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
            plugins: [...currentPlugins, identifier],
          });
        }

        const installedPlugin = pluginSelectors.getInstalledPluginById(identifier)(toolState);

        return {
          content: `Plugin "${installedPlugin?.manifest?.meta?.title || identifier}" is already installed. Enabled for current agent.`,
          state: {
            installed: true,
            pluginId: identifier,
            pluginName: installedPlugin?.manifest?.meta?.title || identifier,
            success: true,
          } as InstallPluginState,
          success: true,
        };
      }

      // Plugin needs to be installed - return state requiring approval
      // The actual installation will happen when user approves
      return {
        content: `MCP plugin "${identifier}" will be installed. Please approve to continue.`,
        state: {
          awaitingApproval: true,
          installed: false,
          pluginId: identifier,
          success: true,
        } as InstallPluginState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to install plugin: ${err.message}`,
        error,
        state: {
          error: err.message,
          installed: false,
          pluginId: identifier,
          success: false,
        } as InstallPluginState,
        success: false,
      };
    }
  }
}
