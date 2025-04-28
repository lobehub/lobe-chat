'use client';

import { Tabs } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { INBOX_SESSION_ID } from '@/const/session';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import AgentSettings from '../../../../../features/AgentSetting/AgentSettings';

const EditPage = memo(() => {
  const { t } = useTranslation('setting');
  const [tab, setTab] = useState(ChatSettingsTabs.Prompt);
  const theme = useTheme();

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
      <Tabs
        compact
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
});

export default EditPage;
