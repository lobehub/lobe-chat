import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';

export const getAgentConfig = () => agentSelectors.currentAgentConfig(useAgentStore.getState());

export const getAgentChatConfig = () =>
  agentChatConfigSelectors.currentChatConfig(useAgentStore.getState());

export const getAgentEnableHistoryCount = () =>
  agentChatConfigSelectors.enableHistoryCount(useAgentStore.getState());

export const getAgentKnowledge = () =>
  agentSelectors.currentEnabledKnowledge(useAgentStore.getState());
