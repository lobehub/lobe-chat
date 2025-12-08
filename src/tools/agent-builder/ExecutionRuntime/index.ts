import { KLAVIS_SERVER_TYPES } from '@lobechat/const';
import { marketToolsResultsPrompt, modelsResultsPrompt } from '@lobechat/prompts';
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
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import type {
  AvailableModel,
  AvailableProvider,
  GetAvailableModelsParams,
  GetAvailableModelsState,
  InstallPluginParams,
  InstallPluginState,
  MarketToolItem,
  SearchMarketToolsParams,
  SearchMarketToolsState,
  TogglePluginParams,
  TogglePluginState,
  UpdateAgentConfigParams,
  UpdateAgentMetaParams,
  UpdateConfigState,
  UpdateMetaState,
  UpdatePromptParams,
  UpdatePromptState,
} from '../types';

/**
 * Agent Builder Execution Runtime
 * Handles the execution logic for all Agent Builder APIs
 *
 * Note: getAgentConfig, getAgentMeta, getPrompt, getAvailableTools, searchOfficialTools are removed
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

  // Note: searchOfficialTools is removed because official tools are now
  // automatically injected into the conversation context via AgentBuilderContextInjector

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
   * Open OAuth window and poll for authentication completion
   * This mimics the behavior in KlavisServerItem.tsx
   */
  private openOAuthWindowAndPoll(oauthUrl: string, identifier: string): void {
    // Polling configuration
    const POLL_INTERVAL_MS = 1000;
    const POLL_TIMEOUT_MS = 15_000;

    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let pollTimeout: ReturnType<typeof setTimeout> | null = null;
    let windowCheckInterval: ReturnType<typeof setInterval> | null = null;

    const cleanup = () => {
      if (windowCheckInterval) {
        clearInterval(windowCheckInterval);
        windowCheckInterval = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (pollTimeout) {
        clearTimeout(pollTimeout);
        pollTimeout = null;
      }
    };

    const startFallbackPolling = () => {
      if (pollInterval) return;

      pollInterval = setInterval(async () => {
        try {
          const toolStore = getToolStoreState();
          const server = klavisStoreSelectors
            .getServers(toolStore)
            .find((s) => s.identifier === identifier);

          if (server?.status === KlavisServerStatus.CONNECTED) {
            cleanup();
            return;
          }

          await toolStore.refreshKlavisServerTools(identifier);
        } catch (error) {
          console.error('[Klavis] Failed to check auth status:', error);
        }
      }, POLL_INTERVAL_MS);

      pollTimeout = setTimeout(() => {
        cleanup();
      }, POLL_TIMEOUT_MS);
    };

    // Open OAuth window
    const oauthWindow = window.open(oauthUrl, '_blank', 'width=600,height=700');

    if (oauthWindow) {
      // Monitor window close
      windowCheckInterval = setInterval(() => {
        try {
          if (oauthWindow.closed) {
            if (windowCheckInterval) {
              clearInterval(windowCheckInterval);
              windowCheckInterval = null;
            }

            // Window closed, check auth status
            getToolStoreState().refreshKlavisServerTools(identifier);
            cleanup();
          }
        } catch {
          // COOP blocked window.closed access, fall back to polling
          console.log('[Klavis] COOP blocked window.closed access, falling back to polling');
          if (windowCheckInterval) {
            clearInterval(windowCheckInterval);
            windowCheckInterval = null;
          }
          startFallbackPolling();
        }
      }, 500);
    } else {
      // Window was blocked, use polling
      startFallbackPolling();
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
                // Needs OAuth authorization - open OAuth window and start polling
                if (klavisServer.oauthUrl) {
                  this.openOAuthWindowAndPoll(klavisServer.oauthUrl, identifier);
                }

                return {
                  content: `Klavis tool "${klavisTypeInfo.label}" requires OAuth authorization. An authorization window has been opened. Please complete the authorization.`,
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
              } else {
                // Server exists but in ERROR state or other unknown state
                return {
                  content: `Klavis tool "${klavisTypeInfo.label}" is in an error state. Please try reconnecting.`,
                  error: 'Klavis server in error state',
                  state: {
                    installed: false,
                    isKlavis: true,
                    pluginId: identifier,
                    pluginName: klavisTypeInfo.label,
                    serverStatus: 'error',
                    success: false,
                  } as InstallPluginState,
                  success: false,
                };
              }
            } else {
              // Server doesn't exist yet, create it using createKlavisServer
              const userId = userProfileSelectors.userId(getUserStoreState());
              if (!userId) {
                return {
                  content: `Cannot connect Klavis tool: User not logged in.`,
                  error: 'User not logged in',
                  state: {
                    installed: false,
                    pluginId: identifier,
                    success: false,
                  } as InstallPluginState,
                  success: false,
                };
              }

              const newServer = await getToolStoreState().createKlavisServer({
                identifier,
                serverName: klavisTypeInfo.serverName,
                userId,
              });

              if (newServer) {
                // Enable the plugin for the agent
                const agentState = getAgentStoreState();
                const currentPlugins =
                  agentSelectors.getAgentConfigById(agentId)(agentState).plugins || [];

                if (!currentPlugins.includes(identifier)) {
                  await getAgentStoreState().optimisticUpdateAgentConfig(agentId, {
                    plugins: [...currentPlugins, identifier],
                  });
                }

                if (newServer.isAuthenticated) {
                  // Already authenticated, refresh tools
                  await getToolStoreState().refreshKlavisServerTools(newServer.identifier);

                  return {
                    content: `Successfully connected and enabled Klavis tool: ${klavisTypeInfo.label}`,
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
                } else if (newServer.oauthUrl) {
                  // Needs OAuth, open window and start polling
                  this.openOAuthWindowAndPoll(newServer.oauthUrl, newServer.identifier);

                  return {
                    content: `Klavis tool "${klavisTypeInfo.label}" requires OAuth authorization. An authorization window has been opened. Please complete the authorization.`,
                    state: {
                      awaitingApproval: true,
                      installed: false,
                      isKlavis: true,
                      oauthUrl: newServer.oauthUrl,
                      pluginId: identifier,
                      pluginName: klavisTypeInfo.label,
                      serverName: klavisTypeInfo.serverName,
                      serverStatus: 'pending_auth',
                      success: true,
                    } as InstallPluginState,
                    success: true,
                  };
                } else {
                  // Server created but neither authenticated nor has OAuth URL
                  return {
                    content: `Klavis tool "${klavisTypeInfo.label}" was created but requires additional setup.`,
                    state: {
                      installed: false,
                      isKlavis: true,
                      pluginId: identifier,
                      pluginName: klavisTypeInfo.label,
                      serverStatus: 'pending_auth',
                      success: true,
                    } as InstallPluginState,
                    success: true,
                  };
                }
              }

              return {
                content: `Failed to connect Klavis tool: ${klavisTypeInfo.label}`,
                error: 'Failed to create Klavis server',
                state: {
                  installed: false,
                  pluginId: identifier,
                  success: false,
                } as InstallPluginState,
                success: false,
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
