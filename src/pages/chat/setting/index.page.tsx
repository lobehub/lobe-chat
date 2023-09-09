import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import AgentSetting from '@/features/AgentSetting';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import DesktopLayout from './layout';
import MobileLayout from './layout.mobile';

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

  const RenderLayout = mobile ? MobileLayout : DesktopLayout;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <RenderLayout>{settings}</RenderLayout>
    </>
  );
});

export default EditPage;
