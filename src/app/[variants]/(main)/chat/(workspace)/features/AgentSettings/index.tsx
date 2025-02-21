'use client';

import { Drawer } from 'antd';
import { useResponsive, useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Header from '@/app/[variants]/(main)/settings/_layout/Desktop/Header';
import { INBOX_SESSION_ID } from '@/const/session';
import AgentChat from '@/features/AgentSetting/AgentChat';
import AgentMeta from '@/features/AgentSetting/AgentMeta';
import AgentModal from '@/features/AgentSetting/AgentModal';
import AgentPlugin from '@/features/AgentSetting/AgentPlugin';
import AgentPrompt from '@/features/AgentSetting/AgentPrompt';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import AgentTTS from '@/features/AgentSetting/AgentTTS';
import Footer from '@/features/Setting/Footer';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import CategoryContent from './CategoryContent';

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

  const ref = useRef<any>(null);
  const theme = useTheme();
  const { md = true, mobile = false } = useResponsive();

  const category = <CategoryContent setTab={setTab} tab={tab} />;
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
        height={'100vh'}
        onClose={() => {
          useAgentStore.setState({ showAgentSetting: false });
        }}
        open={showAgentSetting}
        placement={'bottom'}
        styles={{
          body: { padding: 0 },
          content: {
            background: theme.colorBgContainer,
          },
        }}
        title={t('header.session')}
      >
        <Flexbox height={'100%'} horizontal={md} ref={ref} width={'100%'}>
          {md ? (
            <Flexbox padding={16}>{category}</Flexbox>
          ) : (
            <Header
              getContainer={() => ref.current}
              title={t(`agentTab.${tab as ChatSettingsTabs}`)}
            >
              {category}
            </Header>
          )}
          <Flexbox
            align={'center'}
            gap={mobile ? 0 : 64}
            paddingInline={mobile ? 0 : 56}
            style={{
              background: mobile
                ? theme.colorBgContainer
                : theme.isDarkMode
                  ? theme.colorFillQuaternary
                  : theme.colorBgElevated,
              minHeight: '100%',
              overflowX: 'hidden',
              overflowY: 'auto',
              paddingTop: mobile ? 0 : 16,
            }}
            width={'100%'}
          >
            {tab === ChatSettingsTabs.Meta && <AgentMeta />}
            {tab === ChatSettingsTabs.Prompt && <AgentPrompt />}
            {tab === ChatSettingsTabs.Chat && <AgentChat />}
            {tab === ChatSettingsTabs.Modal && <AgentModal />}
            {tab === ChatSettingsTabs.TTS && <AgentTTS />}
            {tab === ChatSettingsTabs.Plugin && <AgentPlugin />} <Footer />
          </Flexbox>
        </Flexbox>
      </Drawer>
    </AgentSettingsProvider>
  );
});

export default AgentSettings;
