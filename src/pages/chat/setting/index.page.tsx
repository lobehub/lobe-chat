import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';
import AgentSetting from '@/features/AgentSetting';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import ChatLayout from '../layout';
import Header from './Header';
import Mobile from './mobile';

const EditPage = memo(() => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('setting');
  const config = useSessionStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const [updateAgentConfig, updateAgentMeta, title] = useSessionStore((s) => [
    s.updateAgentConfig,
    s.updateAgentMeta,
    agentSelectors.currentAgentTitle(s),
  ]);

  const pageTitle = genSiteHeadTitle(t('header.sessionWithName', { name: title }));

  const settings = (
    <AgentSetting
      config={config}
      meta={meta}
      onConfigChange={updateAgentConfig}
      onMetaChange={updateAgentMeta}
    />
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
