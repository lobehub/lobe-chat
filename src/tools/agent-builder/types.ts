import { LobeAgentChatConfig, LobeAgentConfig, MetaData } from '@lobechat/types';
import type { PartialDeep } from 'type-fest';

/**
 * Agent Builder API Names
 */
export const AgentBuilderApiName = {
  // Read operations
  getAgentConfig: 'agentBuilder_getConfig',
  getAgentMeta: 'agentBuilder_getMeta',

  // Write operations
  setModel: 'agentBuilder_setModel',
  setOpeningMessage: 'agentBuilder_setOpeningMessage',
  setOpeningQuestions: 'agentBuilder_setOpeningQuestions',
  togglePlugin: 'agentBuilder_togglePlugin',
  updateAgentConfig: 'agentBuilder_updateConfig',
  updateAgentMeta: 'agentBuilder_updateMeta',
  updateChatConfig: 'agentBuilder_updateChatConfig',
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
