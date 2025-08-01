import { Highlighter } from '@lobehub/ui';
import { memo, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export interface FunctionMessageProps {
  toolCallId: string;
  variant?: 'filled' | 'outlined' | 'borderless';
}

const PluginResult = memo<FunctionMessageProps>(({ toolCallId, variant }) => {
  const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(toolCallId));

  const data = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(toolMessage?.content || ''), null, 2);
    } catch {
      return toolMessage?.content || '';
    }
  }, [toolMessage?.content]);

  return (
    <Highlighter
      language={'json'}
      style={{ maxHeight: 200, overflow: 'scroll', width: '100%' }}
      variant={variant}
    >
      {data}
    </Highlighter>
  );
});

export default PluginResult;
