'use client';

import { Tabs } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import PageTitle from '@/components/PageTitle';
import SafeSpacing from '@/components/SafeSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';
import { useCategory } from '@/features/AgentSetting/AgentCategory/useCategory';
import AgentSettings from '@/features/AgentSetting/AgentSettings';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import DesktopHeader from '../settings/_layout/Desktop/Header';
import MobileHeader from '../settings/_layout/Mobile/Header';

interface SettingsPageProps {
  mobile?: boolean;
}

const SettingsPage = memo<SettingsPageProps>(({ mobile = false }) => {
  const { t } = useTranslation('setting');
  const [tab, setTab] = useState(ChatSettingsTabs.Prompt);
  const theme = useTheme();
  const cateItems = useCategory();
  const [id, updateAgentMeta, title] = useSessionStore((s) => [
    s.activeId,
    s.updateSessionMeta,
    sessionMetaSelectors.currentAgentTitle(s),
  ]);

  const [updateAgentConfig] = useAgentStore((s) => [s.updateAgentConfig]);

  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

  const { isLoading } = useInitAgentConfig();

  const content = (
    <>
      <PageTitle title={t('header.sessionWithName', { name: title })} />
      <Tabs
        activeKey={tab}
        compact
        items={cateItems as any}
        onChange={(value) => setTab(value as ChatSettingsTabs)}
        style={{
          borderBottom: `1px solid ${theme.colorBorderSecondary}`,
        }}
      />
      <AgentSettings
        config={config}
        id={id}
        loading={isLoading}
        meta={meta}
        onConfigChange={updateAgentConfig}
        onMetaChange={updateAgentMeta}
        tab={tab}
      />
    </>
  );

  if (mobile) {
    return (
      <MobileContentLayout header={<MobileHeader />}>
        {content}
        <Footer />
      </MobileContentLayout>
    );
  }

  return (
    <>
      <DesktopHeader />
      <SettingContainer addonAfter={<Footer />} addonBefore={<SafeSpacing height={HEADER_HEIGHT} />}>
        {content}
      </SettingContainer>
    </>
  );
});

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;
