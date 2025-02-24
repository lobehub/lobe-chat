import { Highlighter } from '@lobehub/ui';
import { memo, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export interface FunctionMessageProps {
  toolCallId: string;
}

const PluginResult = memo<FunctionMessageProps>(({ toolCallId }) => {
  const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(toolCallId));

  const data = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(toolMessage?.content || ''), null, 2);
    } catch {
      return toolMessage?.content || '';
    }
  }, [toolMessage?.content]);

  return (
    <Highlighter language={'json'} style={{ maxHeight: 200, maxWidth: 800, overflow: 'scroll' }}>
      {data}
    </Highlighter>
  );
});

export default PluginResult;
