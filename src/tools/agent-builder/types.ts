import { LobeAgentChatConfig, LobeAgentConfig, MetaData } from '@lobechat/types';
import type { PartialDeep } from 'type-fest';

/**
 * Agent Builder API Names
 */
export const AgentBuilderApiName = {
  // Read operations
  // Note: getAgentConfig, getAgentMeta, getPrompt, getAvailableTools are removed
  // because the current agent context is now automatically injected
  getAvailableModels: 'getAvailableModels',
  installPlugin: 'installPlugin',
  searchMarketTools: 'searchMarketTools',
  searchOfficialTools: 'searchOfficialTools',
  // Write operations
  setModel: 'setModel',
  setOpeningMessage: 'setOpeningMessage',
  setOpeningQuestions: 'setOpeningQuestions',
  togglePlugin: 'togglePlugin',
  updateAgentConfig: 'updateConfig',
  updateAgentMeta: 'updateMeta',
  updateChatConfig: 'updateChatConfig',
  updatePrompt: 'updatePrompt',
} as const;

// ============== Parameter Types ==============

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

// ============== InstallPlugin Types ==============

export interface InstallPluginParams {
  /**
   * Plugin identifier to install
   */
  identifier: string;
  /**
   * Plugin source type: 'market' for MCP marketplace, 'official' for builtin/klavis tools
   */
  source: 'market' | 'official';
}

export interface InstallPluginState {
  /**
   * Whether the plugin requires human approval to continue installation
   * (e.g., Klavis tools need OAuth connection)
   */
  awaitingApproval?: boolean;
  /**
   * Error message if installation failed
   */
  error?: string;
  /**
   * Whether the plugin is installed
   */
  installed: boolean;
  /**
   * Whether the plugin is a Klavis tool that needs OAuth connection
   */
  isKlavis?: boolean;
  /**
   * Klavis OAuth URL if authorization is needed
   */
  oauthUrl?: string;
  /**
   * Plugin identifier
   */
  pluginId: string;
  /**
   * Plugin display name
   */
  pluginName?: string;
  /**
   * Klavis server name (for Klavis tools)
   */
  serverName?: string;
  /**
   * Klavis server status
   */
  serverStatus?: 'connected' | 'pending_auth' | 'error';
  /**
   * Whether the operation was successful
   */
  success: boolean;
}
