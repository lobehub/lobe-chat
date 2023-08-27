import { memo } from 'react';

import AgentConfig from './AgentConfig';
import AgentMeta from './AgentMeta';
import AgentPlugin from './AgentPlugin';
import AgentPrompt from './AgentPrompt';
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
      <AgentPlugin />
    </Provider>
  );
});

export default AgentSettings;
