import { LobeAgentChatConfig, LobeAgentConfig, MetaData } from '@lobechat/types';
import type { PartialDeep } from 'type-fest';

/**
 * Agent Builder API Names
 */
export const AgentBuilderApiName = {
  // Read operations
  getAgentConfig: 'agentBuilder_getConfig',
  getAgentMeta: 'agentBuilder_getMeta',
  getAvailableModels: 'agentBuilder_getAvailableModels',
  getAvailableTools: 'agentBuilder_getAvailableTools',
  getPrompt: 'agentBuilder_getPrompt',
  searchMarketTools: 'agentBuilder_searchMarketTools',
  searchOfficialTools: 'agentBuilder_searchOfficialTools',

  // Write operations
  setModel: 'agentBuilder_setModel',
  setOpeningMessage: 'agentBuilder_setOpeningMessage',
  setOpeningQuestions: 'agentBuilder_setOpeningQuestions',
  togglePlugin: 'agentBuilder_togglePlugin',
  updateAgentConfig: 'agentBuilder_updateConfig',
  updateAgentMeta: 'agentBuilder_updateMeta',
  updateChatConfig: 'agentBuilder_updateChatConfig',
  updatePrompt: 'agentBuilder_updatePrompt',
} as const;

// ============== Parameter Types ==============

export interface GetAgentConfigParams {
  /**
   * Optional: specific fields to retrieve. If not provided, returns all config.
   */
  fields?: string[];
}

export interface GetAgentMetaParams {
  /**
   * Optional: specific fields to retrieve. If not provided, returns all meta.
   */
  fields?: string[];
}

export interface UpdateAgentConfigParams {
  /**
   * Partial agent configuration to update
   */
  config: PartialDeep<LobeAgentConfig>;
}

export interface UpdateAgentMetaParams {
  /**
   * Partial metadata to update
   */
  meta: Partial<MetaData>;
}

export interface UpdateChatConfigParams {
  /**
   * Partial chat configuration to update
   */
  chatConfig: Partial<LobeAgentChatConfig>;
}

export interface TogglePluginParams {
  /**
   * Whether to enable the plugin. If not provided, toggles current state.
   */
  enabled?: boolean;
  /**
   * The plugin identifier to toggle
   */
  pluginId: string;
}

export interface SetModelParams {
  /**
   * The model identifier (e.g., "gpt-4o", "claude-3-5-sonnet")
   */
  model: string;
  /**
   * The provider identifier (e.g., "openai", "anthropic")
   */
  provider: string;
}

export interface SetOpeningMessageParams {
  /**
   * The opening message to display when starting a new conversation
   */
  message: string;
}

export interface SetOpeningQuestionsParams {
  /**
   * Array of suggested questions to display
   */
  questions: string[];
}

export interface GetAvailableModelsParams {
  /**
   * Optional: filter by provider id
   */
  providerId?: string;
}

export interface GetAvailableToolsParams {
  /**
   * Optional: filter by tool type ('builtin' | 'plugin' | 'all')
   */
  type?: 'all' | 'builtin' | 'plugin';
}

export interface GetPromptParams {
  /**
   * Optional: if true, returns a truncated version for preview
   */
  preview?: boolean;
}

export interface UpdatePromptParams {
  /**
   * The new system prompt content (markdown format)
   */
  prompt: string;
  /**
   * Whether to use streaming mode for typewriter effect
   */
  streaming?: boolean;
}

// ============== State Types (for Render components) ==============

export interface GetConfigState {
  config: LobeAgentConfig;
}

export interface GetMetaState {
  meta: MetaData;
}

export interface UpdateConfigState {
  newValues: Record<string, any>;
  previousValues: Record<string, any>;
  success: boolean;
  updatedFields: string[];
}

export interface UpdateMetaState {
  newValues: Partial<MetaData>;
  previousValues: Partial<MetaData>;
  success: boolean;
  updatedFields: string[];
}

export interface TogglePluginState {
  enabled: boolean;
  pluginId: string;
  success: boolean;
}

export interface SetModelState {
  model: string;
  previousModel?: string;
  previousProvider?: string;
  provider: string;
  success: boolean;
}

export interface SetOpeningMessageState {
  message: string;
  previousMessage?: string;
  success: boolean;
}

export interface SetOpeningQuestionsState {
  previousQuestions?: string[];
  questions: string[];
  success: boolean;
}

export interface AvailableModel {
  abilities?: {
    files?: boolean;
    functionCall?: boolean;
    reasoning?: boolean;
    vision?: boolean;
  };
  description?: string;
  id: string;
  name: string;
}

export interface AvailableProvider {
  id: string;
  models: AvailableModel[];
  name: string;
}

export interface GetAvailableModelsState {
  providers: AvailableProvider[];
}

export interface AvailableTool {
  author?: string;
  description?: string;
  identifier: string;
  title: string;
  type: 'builtin' | 'plugin';
}

export interface GetAvailableToolsState {
  tools: AvailableTool[];
}

export interface GetPromptState {
  prompt: string;
}

export interface UpdatePromptState {
  newPrompt: string;
  previousPrompt?: string;
  success: boolean;
}

// ============== SearchMarketTools Types ==============

export interface SearchMarketToolsParams {
  /**
   * Optional: filter by category (e.g., "developer", "productivity", "web-search")
   */
  category?: string;
  /**
   * Optional: number of results to return (default: 10, max: 20)
   */
  pageSize?: number;
  /**
   * Optional: search keywords to find specific tools
   */
  query?: string;
}

export interface MarketToolItem {
  author?: string;
  cloudEndPoint?: string;
  description?: string;
  haveCloudEndpoint?: boolean;
  icon?: string;
  identifier: string;
  installed?: boolean;
  name: string;
  tags?: string[];
}

export interface SearchMarketToolsState {
  query?: string;
  tools: MarketToolItem[];
  totalCount: number;
}

// ============== SearchOfficialTools Types ==============

export interface SearchOfficialToolsParams {
  /**
   * Optional: search keywords to find specific tools
   */
  query?: string;
  /**
   * Optional: filter by tool type ('builtin' | 'klavis' | 'all')
   */
  type?: 'all' | 'builtin' | 'klavis';
}

export interface OfficialToolItem {
  /**
   * Tool author
   */
  author?: string;
  /**
   * Tool description
   */
  description?: string;
  /**
   * Whether the tool is enabled for current agent
   */
  enabled?: boolean;
  /**
   * Icon URL or emoji
   */
  icon?: string;
  /**
   * Tool identifier
   */
  identifier: string;
  /**
   * Whether the tool is installed/connected (for Klavis tools)
   */
  installed?: boolean;
  /**
   * Tool display name
   */
  name: string;
  /**
   * OAuth URL for Klavis tools that need authorization
   */
  oauthUrl?: string;
  /**
   * Server name for Klavis tools (used for API calls)
   */
  serverName?: string;
  /**
   * Klavis server status
   */
  status?: 'connected' | 'error' | 'pending_auth';
  /**
   * Tool type: 'builtin' for built-in tools, 'klavis' for Klavis MCP servers
   */
  type: 'builtin' | 'klavis';
}

export interface SearchOfficialToolsState {
  /**
   * Whether Klavis is enabled in the environment
   */
  klavisEnabled: boolean;
  query?: string;
  tools: OfficialToolItem[];
  totalCount: number;
}
