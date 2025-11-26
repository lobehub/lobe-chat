import { LOADING_FLAT } from '@lobechat/const';
import { UIChatMessage } from '@lobechat/types';
import { MarkdownProps } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { aiChatSelectors, messageStateSelectors } from '@/store/chat/selectors';

import { DefaultMessage } from '../Default';
import ImageFileListViewer from '../User/ImageFileListViewer';
import { CollapsedMessage } from './CollapsedMessage';
import MessageContent from './DisplayContent';
import FileChunks from './FileChunks';
import IntentUnderstanding from './IntentUnderstanding';
import Reasoning from './Reasoning';
import SearchGrounding from './SearchGrounding';

export const AssistantMessageBody = memo<
  UIChatMessage & {
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
    metadata,
    editableContent,
    markdownProps,
    ...props
  }) => {
    const [editing, generating, isCollapsed] = useChatStore((s) => [
      messageStateSelectors.isMessageEditing(id)(s),
      messageStateSelectors.isMessageGenerating(id)(s),
      messageStateSelectors.isMessageCollapsed(id)(s),
    ]);

    const isToolCallGenerating = generating && (content === LOADING_FLAT || !content) && !!tools;

    const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

    const isIntentUnderstanding = useChatStore(aiChatSelectors.isIntentUnderstanding(id));

    const showSearch = !!search && !!search.citations?.length;
    const showImageItems = !!imageList && imageList.length > 0;

    // remove \n to avoid empty content
    // refs: https://github.com/lobehub/lobe-chat/pull/6153
    const showReasoning =
      (!!props.reasoning && props.reasoning.content?.trim() !== '') ||
      (!props.reasoning && isReasoning);

    const showFileChunks = !!chunksList && chunksList.length > 0;

    if (editing)
      return (
        <DefaultMessage
          content={content}
          editableContent={editableContent}
          id={id}
          isToolCallGenerating={isToolCallGenerating}
          {...props}
        />
      );

    if (isCollapsed) return <CollapsedMessage content={content} id={id} />;

    return (
      <Flexbox gap={8} id={id}>
        {showSearch && (
          <SearchGrounding citations={search?.citations} searchQueries={search?.searchQueries} />
        )}
        {showFileChunks && <FileChunks data={chunksList} />}
        {showReasoning && <Reasoning {...props.reasoning} id={id} />}
        {isIntentUnderstanding ? (
          <IntentUnderstanding />
        ) : (
          <MessageContent
            content={content}
            hasImages={showImageItems}
            isMultimodal={metadata?.isMultimodal}
            isToolCallGenerating={isToolCallGenerating}
            markdownProps={markdownProps}
            tempDisplayContent={metadata?.tempDisplayContent}
          />
        )}
        {showImageItems && <ImageFileListViewer items={imageList} />}
      </Flexbox>
    );
  },
);
