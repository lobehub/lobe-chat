'use client';

import { memo } from 'react';

import PageTitle from '@/components/PageTitle';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

const Title = memo(() => {
  const [avatar, title] = useSessionStore((s) => [
    sessionMetaSelectors.currentAgentAvatar(s),
    sessionMetaSelectors.currentAgentTitle(s),
  ]);

  return <PageTitle title={[avatar, title].filter(Boolean).join(' ')} />;
});
export default Title;
