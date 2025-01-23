import { Skeleton } from 'antd';
import { ReactNode, Suspense, memo, useContext } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { aiChatSelectors } from '@/store/chat/slices/aiChat/selectors';
import { ChatMessage } from '@/types/message';

import { InPortalThreadContext } from '../../components/ChatItem/InPortalThreadContext';
import { DefaultMessage } from '../Default';
import FileChunks from './FileChunks';
import Thinking from './Reasoning';
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

  const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

  const showReasoning = !!props.reasoning || (!props.reasoning && isReasoning);

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
      {showReasoning && <Thinking {...props.reasoning} id={id} />}
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
