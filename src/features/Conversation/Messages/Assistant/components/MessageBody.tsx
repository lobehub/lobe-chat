import { LOADING_FLAT } from '@lobechat/const';
import { UIChatMessage } from '@lobechat/types';
import { MarkdownProps } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';

import { CollapsedMessage } from '../../AssistantGroup/CollapsedMessage';
import DisplayContent from '../../components/DisplayContent';
import FileChunks from '../../components/FileChunks';
import ImageFileListViewer from '../../components/ImageFileListViewer';
import IntentUnderstanding from '../../components/IntentUnderstanding';
import Reasoning from '../../components/Reasoning';
import SearchGrounding from '../../components/SearchGrounding';

import { messageStateSelectors, useConversationStore } from '../../../store';

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
    // Use ConversationStore instead of ChatStore
    const editing = useConversationStore(messageStateSelectors.isMessageEditing(id));
    const generating = useConversationStore(messageStateSelectors.isMessageGenerating(id));
    const isCollapsed = useConversationStore(messageStateSelectors.isMessageCollapsed(id));
    const isReasoning = useConversationStore(messageStateSelectors.isMessageInReasoning(id));

    const isToolCallGenerating = generating && (content === LOADING_FLAT || !content) && !!tools;

    // TODO: Need to implement isIntentUnderstanding selector in ConversationStore if needed
    const isIntentUnderstanding = false;

    const showSearch = !!search && !!search.citations?.length;
    const showImageItems = !!imageList && imageList.length > 0;

    // remove \n to avoid empty content
    // refs: https://github.com/lobehub/lobe-chat/pull/6153
    const showReasoning =
      (!!props.reasoning && props.reasoning.content?.trim() !== '') ||
      (!props.reasoning && isReasoning);

    const showFileChunks = !!chunksList && chunksList.length > 0;

    // When editing, show editable content directly
    if (editing) {
      if (isToolCallGenerating) return null;
      if (!content && !showImageItems) return <BubblesLoading />;
      return <div id={id}>{editableContent}</div>;
    }

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
          <DisplayContent
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
