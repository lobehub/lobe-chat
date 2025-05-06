'use client';

import { Drawer } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HeaderContent from '@/app/[variants]/(main)/chat/settings/features/HeaderContent';
import BrandWatermark from '@/components/BrandWatermark';
import PanelTitle from '@/components/PanelTitle';
import { INBOX_SESSION_ID } from '@/const/session';
import { AgentCategory, AgentSettings as Settings } from '@/features/AgentSetting';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import Footer from '@/features/Setting/Footer';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

const AgentSettings = memo(() => {
  const { t } = useTranslation('setting');
  const id = useSessionStore((s) => s.activeId);
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
  const { isLoading } = useInitAgentConfig();
  const [showAgentSetting, updateAgentConfig] = useAgentStore((s) => [
    s.showAgentSetting,
    s.updateAgentConfig,
  ]);
  const [updateAgentMeta] = useSessionStore((s) => [
    s.updateSessionMeta,
    sessionMetaSelectors.currentAgentTitle(s),
  ]);
  const isInbox = id === INBOX_SESSION_ID;

  const [tab, setTab] = useState(isInbox ? ChatSettingsTabs.Prompt : ChatSettingsTabs.Meta);

  return (
    <AgentSettingsProvider
      config={config}
      id={id}
      loading={isLoading}
      meta={meta}
      onConfigChange={updateAgentConfig}
      onMetaChange={updateAgentMeta}
    >
      <Drawer
        containerMaxWidth={1280}
        height={'100vh'}
        noHeader
        onClose={() => useAgentStore.setState({ showAgentSetting: false })}
        open={showAgentSetting}
        placement={'bottom'}
        sidebar={
          <Flexbox
            gap={20}
            style={{
              minHeight: '100%',
            }}
          >
            <PanelTitle desc={t('header.sessionDesc')} title={t('header.session')} />
            <AgentCategory setTab={setTab} tab={tab} />
            <Flexbox align={'center'} gap={8} paddingInline={8} width={'100%'}>
              <HeaderContent modal />
            </Flexbox>
            <BrandWatermark paddingInline={12} />
          </Flexbox>
        }
        sidebarWidth={280}
        styles={{
          sidebarContent: {
            gap: 48,
            justifyContent: 'space-between',
            minHeight: '100%',
            paddingBlock: 24,
            paddingInline: 48,
          },
        }}
      >
        <Settings
          config={config}
          id={id}
          loading={isLoading}
          meta={meta}
          onConfigChange={updateAgentConfig}
          onMetaChange={updateAgentMeta}
          tab={tab}
        />
        <Footer />
      </Drawer>
    </AgentSettingsProvider>
  );
});

export default AgentSettings;
