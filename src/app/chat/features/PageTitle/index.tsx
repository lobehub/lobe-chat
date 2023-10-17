'use client';

import { memo } from 'react';

import PageTitle from '@/components/PageTitle';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const Title = memo(() => {
  const [avatar, title] = useSessionStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentTitle(s),
  ]);

  return <PageTitle title={[avatar, title].filter(Boolean).join(' ')} />;
});
export default Title;
