import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { aiChatSelectors, chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import { DefaultMessage } from '../Default';
import FileChunks from './FileChunks';
import IntentUnderstanding from './IntentUnderstanding';
import Reasoning from './Reasoning';
import SearchGrounding from './SearchGrounding';
import Tool from './Tool';

export const AssistantMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, tools, content, chunksList, search, ...props }) => {
  const editing = useChatStore(chatSelectors.isMessageEditing(id));
  const generating = useChatStore(chatSelectors.isMessageGenerating(id));

  const isToolCallGenerating = generating && (content === LOADING_FLAT || !content) && !!tools;

  const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

  const isIntentUnderstanding = useChatStore(aiChatSelectors.isIntentUnderstanding(id));

  const showSearch = !!search && !!search.citations?.length;

  // remove \n to avoid empty content
  // refs: https://github.com/lobehub/lobe-chat/pull/6153
  const showReasoning =
    (!!props.reasoning && props.reasoning.content?.trim() !== '') ||
    (!props.reasoning && isReasoning);

  const showFileChunks = !!chunksList && chunksList.length > 0;

  return editing ? (
    <DefaultMessage
      content={content}
      id={id}
      isToolCallGenerating={isToolCallGenerating}
      {...props}
    />
  ) : (
    <Flexbox gap={8} id={id}>
      {showSearch && (
        <SearchGrounding citations={search?.citations} searchQueries={search?.searchQueries} />
      )}
      {showFileChunks && <FileChunks data={chunksList} />}
      {showReasoning && <Reasoning {...props.reasoning} id={id} />}
      {isIntentUnderstanding ? (
        <IntentUnderstanding />
      ) : (
        content && (
          <DefaultMessage
            addIdOnDOM={false}
            content={content}
            id={id}
            isToolCallGenerating={isToolCallGenerating}
            {...props}
          />
        )
      )}
      {tools && (
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
            />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});
