import { memo } from 'react';

import AgentConfig from './AgentConfig';
import AgentMeta from './AgentMeta';
import AgentPlugin from './AgentPlugin';
import AgentPrompt from './AgentPrompt';
import AgentTTS from './AgentTTS';
import StoreUpdater, { StoreUpdaterProps } from './StoreUpdater';
import { Provider, createStore } from './store';

type AgentSettingsProps = StoreUpdaterProps;

const AgentSettings = memo<AgentSettingsProps>((props) => {
  return (
    <Provider createStore={createStore}>
      <StoreUpdater {...props} />
      <AgentPrompt />
      <AgentMeta />
      <AgentConfig />
      <AgentTTS />
      <AgentPlugin />
    </Provider>
  );
});

export default AgentSettings;
