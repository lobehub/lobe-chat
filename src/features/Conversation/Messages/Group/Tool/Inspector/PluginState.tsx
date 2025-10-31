import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';

export interface PluginStateProps {
  state?: any;
}

const PluginState = memo<PluginStateProps>(({ state }) => {
  if (!state) return null;

  return (
    <Highlighter language={'json'} style={{ maxHeight: 200, maxWidth: 800, overflow: 'scroll' }}>
      {JSON.stringify(state, null, 2)}
    </Highlighter>
  );
});

export default PluginState;
