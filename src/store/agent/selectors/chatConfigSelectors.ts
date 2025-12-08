import { DEFAULT_AGENT_CHAT_CONFIG, DEFAULT_AGENT_SEARCH_FC_MODEL } from '@lobechat/const';
import { isContextCachingModel, isThinkingWithToolClaudeModel } from '@lobechat/model-runtime';
import { LobeAgentChatConfig } from '@lobechat/types';

import { AgentStoreState } from '@/store/agent/initialState';

import { agentSelectors } from './selectors';

// ============ By AgentId Selectors ============ //

const getAgentChatConfigById =
  (agentId: string) =>
  (s: AgentStoreState): LobeAgentChatConfig =>
    agentSelectors.getAgentConfigById(agentId)(s).chatConfig || {};

const getEnableHistoryCountById = (agentId: string) => (s: AgentStoreState) => {
  const config = agentSelectors.getAgentConfigById(agentId)(s);
  const chatConfig = getAgentChatConfigById(agentId)(s);

  // 如果开启了上下文缓存，且当前模型类型匹配，则不开启历史记录
  const enableContextCaching = !chatConfig.disableContextCaching;

  if (enableContextCaching && isContextCachingModel(config.model)) return false;

  // 当开启搜索时，针对 claude 3.7 sonnet 模型不开启历史记录
  const searchMode = chatConfig.searchMode || 'off';
  const enableSearch = searchMode !== 'off';

  if (enableSearch && isThinkingWithToolClaudeModel(config.model)) return false;

  return chatConfig.enableHistoryCount;
};

const getHistoryCountById =
  (agentId: string) =>
  (s: AgentStoreState): number => {
    const chatConfig = getAgentChatConfigById(agentId)(s);

    return chatConfig.historyCount ?? (DEFAULT_AGENT_CHAT_CONFIG.historyCount as number);
  };

// ============ Current Agent Selectors (复用 ById 方法) ============ //

const currentAgentChatConfig = (s: AgentStoreState): LobeAgentChatConfig =>
  getAgentChatConfigById(s.activeAgentId || '')(s);

const agentSearchMode = (s: AgentStoreState) => currentAgentChatConfig(s).searchMode || 'off';
const isAgentEnableSearch = (s: AgentStoreState) => agentSearchMode(s) !== 'off';

const useModelBuiltinSearch = (s: AgentStoreState) =>
  currentAgentChatConfig(s).useModelBuiltinSearch;

const searchFCModel = (s: AgentStoreState) =>
  currentAgentChatConfig(s).searchFCModel || DEFAULT_AGENT_SEARCH_FC_MODEL;

const enableHistoryCount = (s: AgentStoreState) =>
  getEnableHistoryCountById(s.activeAgentId || '')(s);

const historyCount = (s: AgentStoreState): number => getHistoryCountById(s.activeAgentId || '')(s);

const displayMode = (s: AgentStoreState) => {
  const chatConfig = currentAgentChatConfig(s);

  return chatConfig.displayMode || 'chat';
};

const enableHistoryDivider =
  (historyLength: number, currentIndex: number) => (s: AgentStoreState) => {
    const config = currentAgentChatConfig(s);

    return (
      enableHistoryCount(s) &&
      historyLength > (config.historyCount ?? 0) &&
      config.historyCount === historyLength - currentIndex
    );
  };

export const agentChatConfigSelectors = {
  agentSearchMode,
  currentChatConfig: currentAgentChatConfig,
  displayMode,
  enableHistoryCount,
  enableHistoryDivider,
  getAgentChatConfigById,
  getEnableHistoryCountById,
  getHistoryCountById,
  historyCount,
  isAgentEnableSearch,
  searchFCModel,
  useModelBuiltinSearch,
};

console.log('agentChatConfigSelectors', agentChatConfigSelectors);
