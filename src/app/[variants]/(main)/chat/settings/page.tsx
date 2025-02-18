'use client';

import { TabsNav } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { INBOX_SESSION_ID } from '@/const/session';
import { AgentSettingsProvider } from '@/features/AgentSetting';
import AgentChat from '@/features/AgentSetting/AgentChat';
import AgentMeta from '@/features/AgentSetting/AgentMeta';
import AgentModal from '@/features/AgentSetting/AgentModal';
import AgentPlugin from '@/features/AgentSetting/AgentPlugin';
import AgentPrompt from '@/features/AgentSetting/AgentPrompt';
import AgentTTS from '@/features/AgentSetting/AgentTTS';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

const EditPage = memo(() => {
  const { t } = useTranslation('setting');
  const [tab, setTab] = useState(ChatSettingsTabs.Prompt);

  const [id, updateAgentMeta, title] = useSessionStore((s) => [
    s.activeId,
    s.updateSessionMeta,
    sessionMetaSelectors.currentAgentTitle(s),
  ]);

  const [updateAgentConfig] = useAgentStore((s) => [s.updateAgentConfig]);

  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

  const { isLoading } = useInitAgentConfig();

  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);

  return (
    <>
      <PageTitle title={t('header.sessionWithName', { name: title })} />

      <TabsNav
        items={[
          {
            key: ChatSettingsTabs.Prompt,
            label: t('settingAgent.prompt.title'),
          },
          (id !== INBOX_SESSION_ID && {
            key: ChatSettingsTabs.Meta,
            label: t('settingAgent.title'),
          }) as any,
          {
            key: ChatSettingsTabs.Chat,
            label: t('settingChat.title'),
          },
          {
            key: ChatSettingsTabs.Modal,
            label: t('settingModel.title'),
          },
          {
            key: ChatSettingsTabs.TTS,
            label: t('settingTTS.title'),
          },
          (enablePlugins && {
            key: ChatSettingsTabs.Plugin,
            label: t('settingPlugin.title'),
          }) as any,
        ]}
        onChange={(value) => setTab(value as ChatSettingsTabs)}
        variant={'compact'}
      />
      <AgentSettingsProvider
        config={config}
        id={id}
        loading={isLoading}
        meta={meta}
        onConfigChange={updateAgentConfig}
        onMetaChange={updateAgentMeta}
      >
        {tab === ChatSettingsTabs.Prompt && <AgentPrompt modal />}
        {tab === ChatSettingsTabs.Meta && <AgentMeta />}
        {tab === ChatSettingsTabs.Chat && <AgentChat />}
        {tab === ChatSettingsTabs.Modal && <AgentModal />}
        {tab === ChatSettingsTabs.TTS && <AgentTTS />}
        {tab === ChatSettingsTabs.Plugin && <AgentPlugin />}
      </AgentSettingsProvider>
    </>
  );
});

export default EditPage;
