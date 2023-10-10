'use client';

import { memo } from 'react';

import PageTitle from '@/components/PageTitle';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

const Title = memo(() => {
  const [avatar, title] = useSessionStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentTitle(s),
  ]);
  const pageTitle = genSiteHeadTitle([avatar, title].filter(Boolean).join(' '));

  return <PageTitle title={pageTitle} />;
});
export default Title;
