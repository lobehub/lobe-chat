import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import HeaderSpacing from '@/components/HeaderSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';
import { AgentConfig, AgentMeta, AgentPlugin, AgentPrompt } from '@/features/AgentSetting';
import { agentSelectors, useSessionStore } from '@/store/session';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import ChatLayout from '../../layout';
import Header from './Header';

const EditPage = memo(() => {
  const { t } = useTranslation('setting');
  const config = useSessionStore(agentSelectors.currentAgentConfigSafe, isEqual);
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const [
    updateAgentConfig,
    toggleAgentPlugin,
    autocompleteMeta,
    autocompleteSessionAgentMeta,
    loading,
    updateAgentMeta,
    id,
    title,
  ] = useSessionStore(
    (s) => [
      s.updateAgentConfig,
      s.toggleAgentPlugin,
      s.autocompleteMeta,
      s.autocompleteSessionAgentMeta,
      s.autocompleteLoading,
      s.updateAgentMeta,
      s.activeId,
      agentSelectors.currentAgentTitle(s),
    ],
    shallow,
  );

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
          <AgentPrompt config={config} updateConfig={updateAgentConfig} />
          <AgentMeta
            autocomplete={{ autocompleteMeta, autocompleteSessionAgentMeta, id, loading }}
            config={config}
            meta={meta}
            updateMeta={updateAgentMeta}
          />
          <AgentConfig config={config} updateConfig={updateAgentConfig} />
          <AgentPlugin config={config} updateConfig={toggleAgentPlugin} />
        </Flexbox>
      </ChatLayout>
    </>
  );
});

export default EditPage;
