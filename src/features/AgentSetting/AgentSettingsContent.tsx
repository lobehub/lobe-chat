import { ReactNode, memo } from 'react';

import { useStore } from '@/features/AgentSetting/store';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import AgentChat from './AgentChat';
import AgentMeta from './AgentMeta';
import AgentModal from './AgentModal';
import AgentOpening from './AgentOpening';
import AgentPlugin from './AgentPlugin';
import AgentPrompt from './AgentPrompt';
import AgentTTS from './AgentTTS';

export interface AgentSettingsContentProps {
  loadingSkeleton: ReactNode;
  tab: ChatSettingsTabs;
}

const AgentSettingsContent = memo<AgentSettingsContentProps>(({ tab, loadingSkeleton }) => {
  const loading = useStore((s) => s.loading);
  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);

  if (loading) return loadingSkeleton;

  return (
    <>
      {tab === ChatSettingsTabs.Meta && <AgentMeta />}
      {tab === ChatSettingsTabs.Prompt && <AgentPrompt />}
      {tab === ChatSettingsTabs.Opening && <AgentOpening />}
      {tab === ChatSettingsTabs.Chat && <AgentChat />}
      {tab === ChatSettingsTabs.Modal && <AgentModal />}
      {tab === ChatSettingsTabs.TTS && <AgentTTS />}
      {enablePlugins && tab === ChatSettingsTabs.Plugin && <AgentPlugin />}
    </>
  );
});

export default AgentSettingsContent;
