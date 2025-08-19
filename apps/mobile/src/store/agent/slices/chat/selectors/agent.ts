import type { AgentState } from '../initialState';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings/agent';
import { LobeAgentConfig, LobeAgentTTSConfig } from '@/types/agent';
import { merge } from '@/utils/merge';
import { KnowledgeItem } from '@/types/knowledgeBase';

const INBOX_SESSION_ID = 'inbox';

const isInboxSession = (s: AgentState) => s.activeId === INBOX_SESSION_ID;

// ==========   Config   ============== //

const inboxAgentConfig = (s: AgentState): LobeAgentConfig =>
  merge(s.defaultAgentConfig, s.agentMap[INBOX_SESSION_ID] || {}) as LobeAgentConfig;

/**
 * 根据 ID 获取 Agent 配置
 */
const getAgentConfigById =
  (id: string) =>
  (s: AgentState): LobeAgentConfig =>
    merge(s.defaultAgentConfig, s.agentMap[id] as Partial<LobeAgentConfig>);

/**
 * 获取当前 Agent 配置
 */
export const currentAgentConfig = (s: AgentState): LobeAgentConfig =>
  getAgentConfigById(s.activeId)(s);

// ==========   Model   ============== //

const currentAgentModel = (s: AgentState): string => {
  const config = currentAgentConfig(s);
  return config?.model || DEFAULT_AGENT_CONFIG.model;
};

const currentAgentModelProvider = (s: AgentState): string => {
  const config = currentAgentConfig(s);
  return config?.provider || DEFAULT_AGENT_CONFIG.provider || 'openai';
};

const inboxAgentModel = (s: AgentState): string => {
  const config = inboxAgentConfig(s);
  return config?.model || DEFAULT_AGENT_CONFIG.model;
};

// ==========   System Role   ============== //

const currentAgentSystemRole = (s: AgentState): string => {
  const config = currentAgentConfig(s);
  return config?.systemRole || DEFAULT_AGENT_CONFIG.systemRole || '';
};

const hasSystemRole = (s: AgentState): boolean => {
  const config = currentAgentConfig(s);
  return !!(config?.systemRole && config.systemRole.trim().length > 0);
};

// ==========   Files & Knowledge   ============== //

const currentAgentFiles = (): string[] => {
  // TODO: 移动端暂不实现文件功能
  return [];
};

const currentAgentKnowledgeBases = (): string[] => {
  // TODO: 移动端暂不实现知识库功能
  return [];
};

const currentEnabledKnowledge = (): KnowledgeItem[] => {
  // TODO: 移动端暂不实现知识库功能
  return [];
};

const currentKnowledgeIds = (): string[] => {
  // TODO: 移动端暂不实现知识库功能
  return [];
};

const hasKnowledge = (): boolean => {
  // TODO: 移动端暂不实现知识库功能
  return false;
};

const hasEnabledKnowledge = (): boolean => {
  // TODO: 移动端暂不实现知识库功能
  return false;
};

// ==========   Plugins   ============== //

const currentAgentPlugins = (): string[] => {
  // TODO: 移动端暂不实现插件功能
  return [];
};

// ==========   TTS   ============== //

const currentAgentTTS = (s: AgentState): LobeAgentTTSConfig => {
  const config = currentAgentConfig(s);
  return config?.tts || {};
};

const currentAgentTTSVoice = (s: AgentState): string => {
  const ttsConfig = currentAgentTTS(s);
  return typeof ttsConfig?.voice === 'string' ? ttsConfig.voice : '';
};

// ==========   Opening   ============== //

const openingQuestions = (s: AgentState): string[] => {
  const config = currentAgentConfig(s);
  return config?.chatConfig?.autoCreateTopicThreshold ? [] : [];
};

const openingMessage = (s: AgentState): string => {
  const config = currentAgentConfig(s);
  return config?.openingMessage || '';
};

// ==========   Loading State   ============== //

const isAgentConfigLoading = (): boolean => {
  // 简化版本，移动端暂不实现复杂的加载状态
  return false;
};

/**
 * Agent 选择器聚合 (与 web 端完全一致)
 */
export const agentSelectors = {
  currentAgentConfig,
  currentAgentFiles,
  currentAgentKnowledgeBases,
  currentAgentModel,
  currentAgentModelProvider,
  currentAgentPlugins,
  currentAgentSystemRole,
  currentAgentTTS,
  currentAgentTTSVoice,
  currentEnabledKnowledge,
  currentKnowledgeIds,
  getAgentConfigById,
  hasEnabledKnowledge,
  hasKnowledge,
  hasSystemRole,
  inboxAgentConfig,
  inboxAgentModel,
  isAgentConfigLoading,
  isInboxSession,
  openingMessage,
  openingQuestions,
};
