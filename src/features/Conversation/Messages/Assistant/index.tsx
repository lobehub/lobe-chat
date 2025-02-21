import { Skeleton } from 'antd';
import { ReactNode, Suspense, memo, useContext } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { chatSelectors , aiChatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import { InPortalThreadContext } from '../../components/ChatItem/InPortalThreadContext';
import { DefaultMessage } from '../Default';
import FileChunks from './FileChunks';
import Reasoning from './Reasoning';
import Tool from './Tool';

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

  // remove \n to avoid empty content
  // refs: https://github.com/lobehub/lobe-chat/pull/6153
  const showReasoning =
    (!!props.reasoning && props.reasoning.content?.trim() !== '') ||
    (!props.reasoning && isReasoning);

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
      {showReasoning && <Reasoning {...props.reasoning} id={id} />}
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
              <Tool
                apiName={toolCall.apiName}
                arguments={toolCall.arguments}
                id={toolCall.id}
                identifier={toolCall.identifier}
                index={index}
                key={toolCall.id}
                messageId={id}
                payload={toolCall}
                showPortal={!inThread}
              />
            ))}
          </Flexbox>
        </Suspense>
      )}
    </Flexbox>
  );
});
