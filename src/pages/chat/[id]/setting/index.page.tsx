import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';
import { AgentConfig, AgentMeta, AgentPlugin, AgentPrompt } from '@/features/AgentSetting';
import { agentSelectors, useSessionStore } from '@/store/session';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import ChatLayout from '../layout';
import Header from './Header';
import Mobile from './mobile';

const EditPage = memo(() => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('setting');
  const config = useSessionStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const autocomplete = useSessionStore(agentSelectors.currentAutocomplete);
  const [updateAgentConfig, toggleAgentPlugin, updateAgentMeta, title] = useSessionStore((s) => [
    s.updateAgentConfig,
    s.toggleAgentPlugin,
    s.updateAgentMeta,
    agentSelectors.currentAgentTitle(s),
  ]);

  const pageTitle = genSiteHeadTitle(t('header.sessionWithName', { name: title }));

  const settings = (
    <>
      <AgentPrompt config={config} updateConfig={updateAgentConfig} />
      <AgentMeta
        autocomplete={autocomplete}
        config={config}
        meta={meta}
        updateMeta={updateAgentMeta}
      />
      <AgentConfig config={config} updateConfig={updateAgentConfig} />
      <AgentPlugin config={config} updateConfig={toggleAgentPlugin} />
    </>
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {mobile ? (
        <Mobile>
          <Flexbox gap={16} padding={16}>
            {settings}
          </Flexbox>
        </Mobile>
      ) : (
        <ChatLayout>
          <Header />
          <Flexbox align={'center'} flex={1} gap={16} padding={24} style={{ overflow: 'auto' }}>
            <SafeSpacing height={HEADER_HEIGHT - 16} />
            {settings}
          </Flexbox>
        </ChatLayout>
      )}
    </>
  );
});

export default EditPage;
