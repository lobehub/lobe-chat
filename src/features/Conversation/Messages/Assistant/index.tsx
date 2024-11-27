import { Skeleton } from 'antd';
import { ReactNode, Suspense, memo, useContext } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { InPortalThreadContext } from '@/features/Conversation/components/ChatItem/InPortalThreadContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import { DefaultMessage } from '../Default';
import FileChunks from './FileChunks';
import ToolCall from './ToolCallItem';

export const AssistantMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, tools, content, chunksList, ...props }) => {
  const editing = useChatStore(chatSelectors.isMessageEditing(id));
  const generating = useChatStore(chatSelectors.isMessageGenerating(id));

  const inThread = useContext(InPortalThreadContext);
  const isToolCallGenerating = generating && (content === LOADING_FLAT || !content) && !!tools;

  return editing ? (
    <DefaultMessage
      content={content}
      id={id}
      isToolCallGenerating={isToolCallGenerating}
      {...props}
    />
  ) : (
    <Flexbox gap={8} id={id}>
      {!!chunksList && chunksList.length > 0 && <FileChunks data={chunksList} />}
      {content && (
        <DefaultMessage
          addIdOnDOM={false}
          content={content}
          id={id}
          isToolCallGenerating={isToolCallGenerating}
          {...props}
        />
      )}
      {tools && (
        <Suspense
          fallback={<Skeleton.Button active style={{ height: 46, minWidth: 200, width: '100%' }} />}
        >
          <Flexbox gap={8}>
            {tools.map((toolCall, index) => (
              <ToolCall
                apiName={toolCall.apiName}
                arguments={toolCall.arguments}
                id={toolCall.id}
                identifier={toolCall.identifier}
                index={index}
                key={toolCall.id}
                messageId={id}
                showPortal={!inThread}
              />
            ))}
          </Flexbox>
        </Suspense>
      )}
    </Flexbox>
  );
});
