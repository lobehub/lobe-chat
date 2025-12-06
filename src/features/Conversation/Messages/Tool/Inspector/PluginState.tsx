import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';

import { dataSelectors, useConversationStore } from '../../../store';

export interface FunctionMessageProps {
  toolCallId: string;
}

const PluginState = memo<FunctionMessageProps>(({ toolCallId }) => {
  const toolMessage = useConversationStore(dataSelectors.getDbMessageByToolCallId(toolCallId));

  return (
    toolMessage?.pluginState && (
      <Highlighter language={'json'} style={{ maxHeight: 200, maxWidth: 800, overflow: 'scroll' }}>
        {JSON.stringify(toolMessage?.pluginState, null, 2)}
      </Highlighter>
    )
  );
});

export default PluginState;
