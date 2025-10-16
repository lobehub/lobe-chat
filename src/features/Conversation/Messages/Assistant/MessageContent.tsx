import { LOADING_FLAT } from '@lobechat/const';
import { ChatMessage } from '@lobechat/types';
import { MarkdownProps } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { aiChatSelectors, chatSelectors } from '@/store/chat/selectors';

import { DefaultMessage } from '../Default';
import ImageFileListViewer from '../User/ImageFileListViewer';
import VideoFileListViewer from '../User/VideoFileListViewer';
import { AssistantBlock } from './Block';
import FileChunks from './FileChunks';
import IntentUnderstanding from './IntentUnderstanding';
import Reasoning from './Reasoning';
import SearchGrounding from './SearchGrounding';
import Tool from './Tool';
import { getBlockPosition } from './utils';

export const AssistantMessageContent = memo<
  ChatMessage & {
    editableContent: ReactNode;
    markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
  }
>(
  ({
    id,
    tools,
    content,
    chunksList,
    search,
    imageList,
    videoList,
    children,
    markdownProps,
    ...props
  }) => {
    const editing = useChatStore(chatSelectors.isMessageEditing(id));
    const generating = useChatStore(chatSelectors.isMessageGenerating(id));

    const isToolCallGenerating = generating && (content === LOADING_FLAT || !content) && !!tools;

    const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

    const isIntentUnderstanding = useChatStore(aiChatSelectors.isIntentUnderstanding(id));

    const showSearch = !!search && !!search.citations?.length;
    const showImageItems = !!imageList && imageList.length > 0;
    const showVideoItems = !!videoList && videoList.length > 0;

    // remove \n to avoid empty content
    // refs: https://github.com/lobehub/lobe-chat/pull/6153
    const showReasoning =
      (!!props.reasoning && props.reasoning.content?.trim() !== '') ||
      (!props.reasoning && isReasoning);

    const showFileChunks = !!chunksList && chunksList.length > 0;

    if (children && children?.length > 0) {
      return (
        <Flexbox gap={0}>
          {children.map((item, index) => (
            <AssistantBlock
              blockPosition={getBlockPosition(children, index)}
              index={index}
              key={item.id}
              markdownProps={markdownProps}
              {...item}
            />
          ))}
        </Flexbox>
      );
    }

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
        {showImageItems && <ImageFileListViewer items={imageList} />}
        {showVideoItems && <VideoFileListViewer items={videoList} />}
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
                type={toolCall.type}
              />
            ))}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);
