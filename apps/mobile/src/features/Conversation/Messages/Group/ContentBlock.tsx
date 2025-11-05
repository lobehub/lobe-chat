import { AssistantContentBlock } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';

import { LOADING_FLAT } from '@/_const/message';
import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/selectors';

import Reasoning from '../Assistant/Reasoning';
import ImageFileListViewer from '../User/ImageFileListViewer';
import ErrorContent from './Error';
import MessageContent from './MessageContent';
import { Tools } from './Tools';

interface ContentBlockProps extends AssistantContentBlock {
  index: number;
  isGenerating?: boolean;
  isSummary?: boolean;
}

export const ContentBlock = memo<ContentBlockProps>((props) => {
  const {
    id,
    tools,
    content,
    imageList,
    reasoning,
    error,
    isGenerating,
    isSummary = false,
  } = props;
  const showImageItems = !!imageList && imageList.length > 0;
  const isReasoning = useChatStore(aiChatSelectors.isMessageInReasoning(id));

  const hasTools = tools && tools.length > 0;
  const showReasoning =
    (!!reasoning && reasoning.content?.trim() !== '') || (!reasoning && isReasoning);

  // 带工具的 block，如果不是总结部分，文字内容透明度降低
  const contentOpacity = hasTools && !isSummary ? 0.5 : 1;

  // markdown props for content rendering
  const markdownProps = useMemo(
    () => ({
      animated: isGenerating,
      enableCustomFootnotes: true,
    }),
    [isGenerating],
  );

  if (error && (content === LOADING_FLAT || !content))
    return <ErrorContent error={error} id={id} />;

  return (
    <Flexbox gap={8} id={id}>
      {showReasoning && (
        <Reasoning
          content={reasoning?.content}
          duration={reasoning?.duration}
          id={id}
          isGenerating={isReasoning}
        />
      )}

      {/* Content - markdown text */}
      {content && (
        <Flexbox style={{ opacity: contentOpacity }}>
          <MessageContent content={content} hasTools={hasTools} markdownProps={markdownProps} />
        </Flexbox>
      )}

      {/* Image files */}
      {showImageItems && <ImageFileListViewer items={imageList} />}

      {/* Tools */}
      {hasTools && <Tools messageId={id} tools={tools!} />}
    </Flexbox>
  );
});

ContentBlock.displayName = 'GroupContentBlock';
