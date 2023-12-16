import dynamic from 'next/dynamic';
import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });

const Token = memo(() => {
  const [showTokenTag] = useSessionStore((s) => [agentSelectors.showTokenTag(s)]);

  return showTokenTag && <LargeTokenContent />;
});

export default Token;
