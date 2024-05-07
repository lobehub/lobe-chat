import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import { DefaultMessage } from '../Default';
import ToolCalls from './ToolCalls';

export const AssistantMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, tools, content, ...props }) => {
  const editing = useChatStore(chatSelectors.isMessageEditing(id));

  return (
    <Flexbox gap={8} id={id}>
      {(content || editing) && (
        <DefaultMessage content={content} id={undefined as any} {...props} />
      )}
      {!editing && (
        <Flexbox gap={8} horizontal>
          {tools?.map((toolCall) => (
            <ToolCalls
              arguments={toolCall.arguments}
              identifier={toolCall.identifier}
              key={toolCall.id}
            />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});
