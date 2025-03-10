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

  // 只要是内置的搜索实现，一定可以联网搜索
  if (searchImpl === 'internal') return true;

  // 如果是关闭状态，一定不能联网搜索
  return agentSearchMode !== 'off';
};
