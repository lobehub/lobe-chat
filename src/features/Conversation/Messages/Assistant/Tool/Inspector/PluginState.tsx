import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export interface FunctionMessageProps {
  toolCallId: string;
}

const PluginState = memo<FunctionMessageProps>(({ toolCallId }) => {
  const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(toolCallId));

  return (
    <Highlighter language={'json'} style={{ maxHeight: 200, maxWidth: 800, overflow: 'scroll' }}>
      {toolMessage?.pluginState}
    </Highlighter>
  );
});

export default PluginState;
