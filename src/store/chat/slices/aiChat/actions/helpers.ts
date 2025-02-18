import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

export const getAgentConfig = () => agentSelectors.currentAgentConfig(useAgentStore.getState());
export const getAgentChatConfig = () =>
  agentSelectors.currentAgentChatConfig(useAgentStore.getState());

export const getAgentKnowledge = () =>
  agentSelectors.currentEnabledKnowledge(useAgentStore.getState());
