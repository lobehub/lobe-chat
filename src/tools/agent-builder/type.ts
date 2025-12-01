import { AgentItem, LobeAgentChatConfig } from '@lobechat/types';
import { LLMParams } from 'model-bank';

// ===== API Name Constants =====
export const AgentBuilderApiName = {
  // Query APIs
  getAgentInfo: 'getAgentInfo',
  listAvailableModels: 'listAvailableModels',
  listAvailableTools: 'listAvailableTools',

  // Create/Update APIs
  createAgent: 'createAgent',
  updateAgentMeta: 'updateAgentMeta',
  updateModelConfig: 'updateModelConfig',
  updateSystemRole: 'updateSystemRole',

  // Tool Configuration APIs
  disableTool: 'disableTool',
  enableTool: 'enableTool',

  // Knowledge Base APIs
  addKnowledgeBase: 'addKnowledgeBase',
  removeKnowledgeBase: 'removeKnowledgeBase',

  // Advanced Configuration APIs
  updateChatConfig: 'updateChatConfig',
  updateOpeningConfig: 'updateOpeningConfig',
} as const;

// ===== Parameter Types =====

export interface GetAgentInfoParams {
  agentId?: string;
}

export interface ListAvailableToolsParams {
  category?: 'all' | 'builtin' | 'plugin';
}

export interface ListAvailableModelsParams {
  provider?: string;
}

export interface CreateAgentParams {
  avatar?: string;
  description?: string;
  model?: string;
  plugins?: string[];
  provider?: string;
  systemRole: string;
  tags?: string[];
  title: string;
}

export interface UpdateAgentMetaParams {
  avatar?: string;
  backgroundColor?: string;
  description?: string;
  tags?: string[];
  title?: string;
}

export interface UpdateSystemRoleParams {
  append?: boolean;
  systemRole: string;
}

export interface UpdateModelConfigParams {
  frequencyPenalty?: number;
  maxTokens?: number;
  model?: string;
  presencePenalty?: number;
  provider?: string;
  temperature?: number;
  topP?: number;
}

export interface EnableToolParams {
  toolId: string;
}

export interface DisableToolParams {
  toolId: string;
}

export interface AddKnowledgeBaseParams {
  knowledgeBaseId: string;
}

export interface RemoveKnowledgeBaseParams {
  knowledgeBaseId: string;
}

export interface UpdateChatConfigParams {
  autoCreateTopicThreshold?: number;
  displayMode?: 'chat' | 'docs';
  enableAutoCreateTopic?: boolean;
  enableCompressHistory?: boolean;
  enableHistoryCount?: boolean;
  historyCount?: number;
}

export interface UpdateOpeningConfigParams {
  openingMessage?: string;
  openingQuestions?: string[];
}

// ===== State Types (for Render components) =====

export interface ToolInfo {
  category: 'builtin' | 'plugin';
  description: string;
  enabled: boolean;
  id: string;
  name: string;
}

export interface ModelInfo {
  description?: string;
  id: string;
  name: string;
  provider: string;
}

export interface KnowledgeBaseInfo {
  id: string;
  name: string;
}

export interface AgentInfoState {
  agent: Partial<AgentItem> | null;
  chatConfig?: LobeAgentChatConfig;
  enabledTools: string[];
  knowledgeBases: KnowledgeBaseInfo[];
  params?: LLMParams;
}

export interface AvailableToolsState {
  tools: ToolInfo[];
}

export interface AvailableModelsState {
  models: ModelInfo[];
}

export interface CreateAgentState {
  agentId: string;
  success: boolean;
  title: string;
}

export interface UpdateResultState {
  message: string;
  success: boolean;
  updatedFields: string[];
}

export interface ToolConfigState {
  enabled: boolean;
  success: boolean;
  toolId: string;
  toolName: string;
}

export interface KnowledgeBaseConfigState {
  added?: boolean;
  knowledgeBaseId: string;
  knowledgeBaseName?: string;
  removed?: boolean;
  success: boolean;
}
