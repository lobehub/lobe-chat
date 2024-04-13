import dynamic from 'next/dynamic';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });

const Token = memo(() => {
  const model = useSessionStore(agentSelectors.currentAgentModel);
  const showTag = useGlobalStore(modelProviderSelectors.isModelHasMaxToken(model));

  return showTag && <LargeTokenContent />;
});

export default Token;
