'use client';

import { memo } from 'react';
import Helmet from 'react-helmet';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

const Head = memo(() => {
  const [avatar, title] = useSessionStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentTitle(s),
  ]);
  const pageTitle = genSiteHeadTitle([avatar, title].filter(Boolean).join(' '));

  return (
    <Helmet>
      <title>{pageTitle}</title>
    </Helmet>
  );
});
export default Head;
