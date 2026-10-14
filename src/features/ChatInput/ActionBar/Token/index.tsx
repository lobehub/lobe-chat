import { type PropsWithChildren } from 'react';
import { memo } from 'react';

import dynamic from '@/libs/next/dynamic';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import { useAgentId } from '../../hooks/useAgentId';
import { useEffectiveModel } from '../../hooks/useEffectiveModel';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });

const Token = memo<PropsWithChildren>(({ children }) => {
  const agentId = useAgentId();
  const { model, provider } = useEffectiveModel(agentId);
  const showTag = useAiInfraStore(aiModelSelectors.isModelHasContextWindowToken(model, provider));

  return showTag && children;
});

const ContextWindow = () => {
  return (
    <Token>
      <LargeTokenContent />
    </Token>
  );
};

export default ContextWindow;
