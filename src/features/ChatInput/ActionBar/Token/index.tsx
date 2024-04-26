import dynamic from 'next/dynamic';
import { memo } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });

const Token = memo(() => {
  const model = useAgentStore(agentSelectors.currentAgentModel);
  const showTag = useGlobalStore(modelProviderSelectors.isModelHasMaxToken(model));

  return showTag && <LargeTokenContent />;
});

export default Token;
