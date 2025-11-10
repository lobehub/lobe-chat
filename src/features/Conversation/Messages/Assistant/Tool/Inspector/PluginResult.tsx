import { Highlighter } from '@lobehub/ui';
import { memo, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { dbMessageSelectors } from '@/store/chat/selectors';

export interface FunctionMessageProps {
  toolCallId: string;
  variant?: 'filled' | 'outlined' | 'borderless';
}

const PluginResult = memo<FunctionMessageProps>(({ toolCallId, variant }) => {
  const toolMessage = useChatStore(dbMessageSelectors.getDbMessageByToolCallId(toolCallId));

  const { data, language } = useMemo(() => {
    try {
      const parsed = JSON.parse(toolMessage?.content || '');
      // Special case: if the parsed result is a string, it means the original content was a stringified string
      if (typeof parsed === 'string') {
        return { data: parsed, language: 'plaintext' }; // Return the parsed string directly, do not re-serialize
      }
      return { data: JSON.stringify(parsed, null, 2), language: 'json' };
    } catch {
      return { data: toolMessage?.content || '', language: 'plaintext' };
    }
  }, [toolMessage?.content]);

  return (
    <Highlighter
      language={language}
      style={{ maxHeight: 200, overflow: 'scroll', width: '100%' }}
      variant={variant}
    >
      {data}
    </Highlighter>
  );
});

export default PluginResult;
