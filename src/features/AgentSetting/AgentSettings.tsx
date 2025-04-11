import { Skeleton } from 'antd';
import { Suspense } from 'react';

import { ChatSettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import AgentChat from './AgentChat';
import AgentMeta from './AgentMeta';
import AgentModal from './AgentModal';
import AgentPlugin from './AgentPlugin';
import AgentPrompt from './AgentPrompt';
import { AgentSettingsProvider } from './AgentSettingsProvider';
import AgentTTS from './AgentTTS';
import { StoreUpdaterProps } from './StoreUpdater';

interface AgentSettingsProps extends StoreUpdaterProps {
  tab: ChatSettingsTabs;
}

export const AgentSettings = ({ tab = ChatSettingsTabs.Meta, ...rest }: AgentSettingsProps) => {
  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);

  const loading = <Skeleton active paragraph={{ rows: 6 }} title={false} />;

  return (
    <AgentSettingsProvider {...rest}>
      {rest.loading ? (
        loading
      ) : (
        <Suspense fallback={loading}>
          {tab === ChatSettingsTabs.Meta && <AgentMeta />}
          {tab === ChatSettingsTabs.Prompt && <AgentPrompt />}
          {tab === ChatSettingsTabs.Chat && <AgentChat />}
          {tab === ChatSettingsTabs.Modal && <AgentModal />}
          {tab === ChatSettingsTabs.TTS && <AgentTTS />}
          {enablePlugins && tab === ChatSettingsTabs.Plugin && <AgentPlugin />}
        </Suspense>
      )}
    </AgentSettingsProvider>
  );
};
