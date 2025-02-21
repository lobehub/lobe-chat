import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import AgentChat from './AgentChat';
import AgentMeta from './AgentMeta';
import AgentModal from './AgentModal';
import AgentPlugin from './AgentPlugin';
import AgentPrompt from './AgentPrompt';
import { AgentSettingsProvider } from './AgentSettingsProvider';
import AgentTTS from './AgentTTS';
import { StoreUpdaterProps } from './StoreUpdater';

type AgentSettingsProps = StoreUpdaterProps;

export const AgentSettings = (props: AgentSettingsProps) => {
  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);
  return (
    <AgentSettingsProvider {...props}>
      <AgentPrompt />
      <AgentMeta />
      <AgentChat />
      <AgentModal />
      <AgentTTS />
      {enablePlugins && <AgentPlugin />}
    </AgentSettingsProvider>
  );
};
