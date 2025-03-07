import { contextCachingModels, thinkingWithToolClaudeModels } from '@/const/models';
import { AgentStoreState } from '@/store/agent/initialState';
import { LobeAgentChatConfig } from '@/types/agent';

import { currentAgentConfig } from './agent';

export const currentAgentChatConfig = (s: AgentStoreState): LobeAgentChatConfig =>
  currentAgentConfig(s).chatConfig || {};

const agentSearchMode = (s: AgentStoreState) => currentAgentChatConfig(s).searchMode || 'off';
const isAgentEnableSearch = (s: AgentStoreState) => agentSearchMode(s) !== 'off';

const useModelBuiltinSearch = (s: AgentStoreState) =>
  currentAgentChatConfig(s).useModelBuiltinSearch;

const enableHistoryCount = (s: AgentStoreState) => {
  const config = currentAgentConfig(s);
  const chatConfig = currentAgentChatConfig(s);

  // 如果开启了上下文缓存，且当前模型类型匹配，则不开启历史记录
  const enableContextCaching = !chatConfig.disableContextCaching;

  if (enableContextCaching && contextCachingModels.has(config.model)) return false;

  // 当开启搜索时，针对 claude 3.7 sonnet 模型不开启历史记录
  const enableSearch = isAgentEnableSearch(s);

  if (enableSearch && thinkingWithToolClaudeModels.has(config.model)) return false;

  return chatConfig.enableHistoryCount;
};

const historyCount = (s: AgentStoreState) => {
  const chatConfig = currentAgentChatConfig(s);

  return chatConfig.historyCount;
};

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
  historyCount,
  isAgentEnableSearch,
  useModelBuiltinSearch,
};
