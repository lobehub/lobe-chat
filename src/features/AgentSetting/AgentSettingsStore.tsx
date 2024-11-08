import { memo } from 'react';

import StoreUpdater, { StoreUpdaterProps } from './StoreUpdater';
import { Provider, createStore } from './store';

type AgentSettingsProps = StoreUpdaterProps;

export const AgentSettingsStore = memo<AgentSettingsProps>((props) => {
  return (
    <Provider createStore={createStore}>
      <StoreUpdater {...props} />
    </Provider>
  );
});
