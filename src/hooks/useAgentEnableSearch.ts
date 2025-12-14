import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

export const useAgentEnableSearch = () => {
  const [model, provider, agentSearchMode] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
    agentChatConfigSelectors.agentSearchMode(s),
  ]);

  const searchImpl = useAiInfraStore(aiModelSelectors.modelBuiltinSearchImpl(model, provider));

  // Built-in search implementation always supports online search
  if (searchImpl === 'internal') return true;

  // If disabled, online search is not allowed
  return agentSearchMode !== 'off';
};
