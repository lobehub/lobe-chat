import { BuiltinServerRuntimeOutput } from '@lobechat/types';
import type { PartialDeep } from 'type-fest';

import { agentService } from '@/services/agent';
import { sessionService } from '@/services/session';
import { builtinTools } from '@/tools/index';
import { LobeAgentConfig } from '@/types/agent';
import { LobeSessionType } from '@/types/session';

import {
  AddKnowledgeBaseParams,
  AgentInfoState,
  AvailableModelsState,
  AvailableToolsState,
  CreateAgentParams,
  CreateAgentState,
  DisableToolParams,
  EnableToolParams,
  GetAgentInfoParams,
  KnowledgeBaseConfigState,
  ListAvailableModelsParams,
  ListAvailableToolsParams,
  RemoveKnowledgeBaseParams,
  ToolConfigState,
  ToolInfo,
  UpdateAgentMetaParams,
  UpdateChatConfigParams,
  UpdateModelConfigParams,
  UpdateOpeningConfigParams,
  UpdateResultState,
  UpdateSystemRoleParams,
} from '../type';

export interface AgentBuilderRuntimeOptions {
  /**
   * Current agent ID
   */
  agentId: string;
  /**
   * Function to get current agent config
   */
  getAgentConfig: () => LobeAgentConfig | undefined;
  /**
   * Function to get installed plugins
   */
  getInstalledPlugins?: () => Array<{ identifier: string; meta?: { description?: string; title?: string } }>;
  /**
   * Function to update agent config
   */
  updateAgentConfig: (config: PartialDeep<LobeAgentConfig>) => Promise<void>;
  /**
   * Function to update agent meta
   */
  updateAgentMeta: (meta: Record<string, any>) => Promise<void>;
}

export class AgentBuilderExecutionRuntime {
  private options: AgentBuilderRuntimeOptions;

  constructor(options: AgentBuilderRuntimeOptions) {
    this.options = options;
  }

  async getAgentInfo(_params: GetAgentInfoParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const agentConfig = this.options.getAgentConfig();

      if (!agentConfig) {
        return {
          content: 'No active agent found. Please create an agent first.',
          success: false,
        };
      }

      const state: AgentInfoState = {
        agent: {
          avatar: (agentConfig as any).avatar,
          description: (agentConfig as any).description,
          model: agentConfig.model,
          provider: agentConfig.provider,
          systemRole: agentConfig.systemRole,
          tags: (agentConfig as any).tags,
          title: (agentConfig as any).title,
        },
        chatConfig: agentConfig.chatConfig,
        enabledTools: agentConfig.plugins || [],
        knowledgeBases: (agentConfig.knowledgeBases || []).map((kb: { id: string; name?: string }) => ({
          id: kb.id,
          name: kb.name || kb.id,
        })),
        params: agentConfig.params,
      };

      const content = JSON.stringify({
        avatar: state.agent?.avatar,
        chatConfig: state.chatConfig,
        description: state.agent?.description,
        enabledTools: state.enabledTools,
        knowledgeBases: state.knowledgeBases.map((kb) => kb.id),
        model: state.agent?.model,
        openingMessage: agentConfig.openingMessage,
        openingQuestions: agentConfig.openingQuestions,
        params: state.params,
        provider: state.agent?.provider,
        systemRole: state.agent?.systemRole,
        tags: state.agent?.tags,
        title: state.agent?.title,
      });

      return { content, state, success: true };
    } catch (error) {
      return {
        content: `Failed to get agent info: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async listAvailableTools(params: ListAvailableToolsParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const agentConfig = this.options.getAgentConfig();
      const enabledPlugins = agentConfig?.plugins || [];
      const category = params.category || 'all';

      const tools: ToolInfo[] = [];

      // Add builtin tools
      if (category === 'all' || category === 'builtin') {
        for (const tool of builtinTools) {
          if (tool.hidden) continue;

          tools.push({
            category: 'builtin',
            description: tool.manifest.meta?.description || '',
            enabled: enabledPlugins.includes(tool.identifier),
            id: tool.identifier,
            name: tool.manifest.meta?.title || tool.identifier,
          });
        }
      }

      // Add installed plugins
      if (category === 'all' || category === 'plugin') {
        const installedPlugins = this.options.getInstalledPlugins?.() || [];
        for (const plugin of installedPlugins) {
          tools.push({
            category: 'plugin',
            description: plugin.meta?.description || '',
            enabled: enabledPlugins.includes(plugin.identifier),
            id: plugin.identifier,
            name: plugin.meta?.title || plugin.identifier,
          });
        }
      }

      const state: AvailableToolsState = { tools };

      const content = JSON.stringify(
        tools.map((t) => ({
          category: t.category,
          description: t.description,
          enabled: t.enabled,
          id: t.id,
          name: t.name,
        })),
      );

      return { content, state, success: true };
    } catch (error) {
      return {
        content: `Failed to list tools: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async listAvailableModels(_params: ListAvailableModelsParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      // This would need to be connected to the AI infrastructure store
      // For now, return a basic list of common models
      const models = [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'google' },
      ];

      const state: AvailableModelsState = { models };

      return {
        content: JSON.stringify(models),
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to list models: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async createAgent(params: CreateAgentParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      // Note: sessionService.createSession uses 'as any' internally for config
      const sessionId = await sessionService.createSession(LobeSessionType.Agent, {
        config: {
          model: params.model || 'gpt-4o-mini',
          plugins: params.plugins || [],
          provider: params.provider || 'openai',
          systemRole: params.systemRole,
        } as unknown as LobeAgentConfig,
        meta: {
          avatar: params.avatar,
          description: params.description,
          tags: params.tags,
          title: params.title,
        },
      });

      const state: CreateAgentState = {
        agentId: sessionId,
        success: true,
        title: params.title,
      };

      return {
        content: `Successfully created agent "${params.title}" with ID: ${sessionId}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to create agent: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async updateAgentMeta(params: UpdateAgentMetaParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const updatedFields: string[] = [];
      const updateData: Record<string, any> = {};

      if (params.title !== undefined) {
        updateData.title = params.title;
        updatedFields.push('title');
      }
      if (params.description !== undefined) {
        updateData.description = params.description;
        updatedFields.push('description');
      }
      if (params.avatar !== undefined) {
        updateData.avatar = params.avatar;
        updatedFields.push('avatar');
      }
      if (params.backgroundColor !== undefined) {
        updateData.backgroundColor = params.backgroundColor;
        updatedFields.push('backgroundColor');
      }
      if (params.tags !== undefined) {
        updateData.tags = params.tags;
        updatedFields.push('tags');
      }

      await this.options.updateAgentMeta(updateData);

      const state: UpdateResultState = {
        message: `Updated: ${updatedFields.join(', ')}`,
        success: true,
        updatedFields,
      };

      return {
        content: `Successfully updated agent meta: ${updatedFields.join(', ')}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to update agent meta: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async updateSystemRole(params: UpdateSystemRoleParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      let newSystemRole = params.systemRole;

      if (params.append) {
        const currentConfig = this.options.getAgentConfig();
        newSystemRole = `${currentConfig?.systemRole || ''}\n\n${params.systemRole}`;
      }

      await this.options.updateAgentConfig({ systemRole: newSystemRole });

      const state: UpdateResultState = {
        message: params.append ? 'Appended to system role' : 'Updated system role',
        success: true,
        updatedFields: ['systemRole'],
      };

      return {
        content: `Successfully ${params.append ? 'appended to' : 'updated'} system role`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to update system role: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async updateModelConfig(params: UpdateModelConfigParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const updatedFields: string[] = [];
      const updateData: PartialDeep<LobeAgentConfig> = {};

      if (params.model !== undefined) {
        updateData.model = params.model;
        updatedFields.push('model');
      }
      if (params.provider !== undefined) {
        updateData.provider = params.provider;
        updatedFields.push('provider');
      }

      // Handle params nested object
      const paramsUpdate: Record<string, any> = {};
      if (params.temperature !== undefined) {
        paramsUpdate.temperature = params.temperature;
        updatedFields.push('temperature');
      }
      if (params.topP !== undefined) {
        paramsUpdate.top_p = params.topP;
        updatedFields.push('topP');
      }
      if (params.maxTokens !== undefined) {
        paramsUpdate.max_tokens = params.maxTokens;
        updatedFields.push('maxTokens');
      }
      if (params.presencePenalty !== undefined) {
        paramsUpdate.presence_penalty = params.presencePenalty;
        updatedFields.push('presencePenalty');
      }
      if (params.frequencyPenalty !== undefined) {
        paramsUpdate.frequency_penalty = params.frequencyPenalty;
        updatedFields.push('frequencyPenalty');
      }

      if (Object.keys(paramsUpdate).length > 0) {
        updateData.params = paramsUpdate;
      }

      await this.options.updateAgentConfig(updateData);

      const state: UpdateResultState = {
        message: `Updated model config: ${updatedFields.join(', ')}`,
        success: true,
        updatedFields,
      };

      return {
        content: `Successfully updated model configuration: ${updatedFields.join(', ')}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to update model config: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async enableTool(params: EnableToolParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const currentConfig = this.options.getAgentConfig();
      const currentPlugins = currentConfig?.plugins || [];

      if (!currentPlugins.includes(params.toolId)) {
        await this.options.updateAgentConfig({
          plugins: [...currentPlugins, params.toolId],
        });
      }

      // Get tool name
      const tool = builtinTools.find((t) => t.identifier === params.toolId);
      const toolName = tool?.manifest.meta?.title || params.toolId;

      const state: ToolConfigState = {
        enabled: true,
        success: true,
        toolId: params.toolId,
        toolName,
      };

      return {
        content: `Successfully enabled tool: ${toolName}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to enable tool: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async disableTool(params: DisableToolParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const currentConfig = this.options.getAgentConfig();
      const currentPlugins = currentConfig?.plugins || [];

      await this.options.updateAgentConfig({
        plugins: currentPlugins.filter((p: string) => p !== params.toolId),
      });

      // Get tool name
      const tool = builtinTools.find((t) => t.identifier === params.toolId);
      const toolName = tool?.manifest.meta?.title || params.toolId;

      const state: ToolConfigState = {
        enabled: false,
        success: true,
        toolId: params.toolId,
        toolName,
      };

      return {
        content: `Successfully disabled tool: ${toolName}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to disable tool: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async addKnowledgeBase(params: AddKnowledgeBaseParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      await agentService.createAgentKnowledgeBase(
        this.options.agentId,
        params.knowledgeBaseId,
        true,
      );

      const state: KnowledgeBaseConfigState = {
        added: true,
        knowledgeBaseId: params.knowledgeBaseId,
        success: true,
      };

      return {
        content: `Successfully added knowledge base: ${params.knowledgeBaseId}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to add knowledge base: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async removeKnowledgeBase(params: RemoveKnowledgeBaseParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      await agentService.deleteAgentKnowledgeBase(this.options.agentId, params.knowledgeBaseId);

      const state: KnowledgeBaseConfigState = {
        knowledgeBaseId: params.knowledgeBaseId,
        removed: true,
        success: true,
      };

      return {
        content: `Successfully removed knowledge base: ${params.knowledgeBaseId}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to remove knowledge base: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async updateChatConfig(params: UpdateChatConfigParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const updatedFields: string[] = Object.keys(params).filter(
        (key) => params[key as keyof UpdateChatConfigParams] !== undefined,
      );

      await this.options.updateAgentConfig({ chatConfig: params });

      const state: UpdateResultState = {
        message: `Updated chat config: ${updatedFields.join(', ')}`,
        success: true,
        updatedFields,
      };

      return {
        content: `Successfully updated chat configuration: ${updatedFields.join(', ')}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to update chat config: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }

  async updateOpeningConfig(params: UpdateOpeningConfigParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const updatedFields: string[] = [];

      if (params.openingMessage !== undefined) {
        updatedFields.push('openingMessage');
      }
      if (params.openingQuestions !== undefined) {
        updatedFields.push('openingQuestions');
      }

      await this.options.updateAgentConfig({
        openingMessage: params.openingMessage,
        openingQuestions: params.openingQuestions,
      });

      const state: UpdateResultState = {
        message: `Updated: ${updatedFields.join(', ')}`,
        success: true,
        updatedFields,
      };

      return {
        content: `Successfully updated opening configuration: ${updatedFields.join(', ')}`,
        state,
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to update opening config: ${(error as Error).message}`,
        error,
        success: false,
      };
    }
  }
}
