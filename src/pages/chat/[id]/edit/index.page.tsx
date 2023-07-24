import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import HeaderSpacing from '@/components/HeaderSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';
import { agentSelectors, useSessionStore } from '@/store/session';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import ChatLayout from '../../layout';
import AgentConfig from './AgentConfig';
import AgentMeta from './AgentMeta';
import AgentPlugin from './AgentPlugin';
import AgentPrompt from './AgentPrompt';
import Header from './Header';

const EditPage = memo(() => {
  const { t } = useTranslation('setting');

  const title = useSessionStore(agentSelectors.currentAgentTitle, shallow);
  const pageTitle = genSiteHeadTitle(t('header.sessionWithName', { name: title }));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <ChatLayout>
        <Header />
        <Flexbox align={'center'} flex={1} gap={16} padding={24} style={{ overflow: 'auto' }}>
          <HeaderSpacing height={HEADER_HEIGHT - 16} />
          <AgentPrompt />
          <AgentMeta />
          <AgentConfig />
          <AgentPlugin />
        </Flexbox>
      </ChatLayout>
    </>
  );
});

export default EditPage;
