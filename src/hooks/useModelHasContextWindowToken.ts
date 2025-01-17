import { isDeprecatedEdition } from '@/const/version';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

export const useModelHasContextWindowToken = () => {
  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);
  const newValue = useAiInfraStore(aiModelSelectors.isModelHasContextWindowToken(model, provider));

  // TODO: remove this in V2.0
  const oldValue = useUserStore(modelProviderSelectors.isModelHasMaxToken(model));
  if (isDeprecatedEdition) return oldValue;
  //

  return newValue;
};
