import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

export const useAgentEnableSearch = () => {
  const [model, provider, agentSearchMode] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
    agentSelectors.agentSearchMode(s),
  ]);

  const isModelSupportToolUse = useAiInfraStore(
    aiModelSelectors.isModelSupportToolUse(model, provider),
  );
  const searchImpl = useAiInfraStore(aiModelSelectors.modelBuiltinSearchImpl(model, provider));

  // 只要是内置的搜索实现，一定可以联网搜索
  if (searchImpl === 'internal') return true;

  // 如果是关闭状态，一定不能联网搜索
  if (agentSearchMode === 'off') return false;

  // 如果是智能模式，根据是否支持 Tool Calling 判断
  if (agentSearchMode === 'auto') {
    return isModelSupportToolUse;
  }
};
