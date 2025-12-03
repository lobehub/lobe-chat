import { deserializeParts } from '@lobechat/utils';
import { Markdown, MarkdownProps } from '@lobehub/ui';
import { memo } from 'react';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import { RichContentRenderer } from '@/features/ChatList/components/RichContentRenderer';
import { normalizeThinkTags, processWithArtifact } from '@/features/ChatList/utils/markdown';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

const MessageContent = memo<{
  addIdOnDOM?: boolean;
  content: string;
  hasImages?: boolean;
  isMultimodal?: boolean;
  isToolCallGenerating?: boolean;
  markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
  tempDisplayContent?: string;
}>(
  ({
    markdownProps,
    content,
    isToolCallGenerating,
    hasImages,
    isMultimodal,
    tempDisplayContent,
  }) => {
    const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
    const message = normalizeThinkTags(processWithArtifact(content));
    if (isToolCallGenerating) return;

    if ((!content && !hasImages) || content === LOADING_FLAT) return <BubblesLoading />;

    const contentParts = isMultimodal ? deserializeParts(tempDisplayContent || content) : null;

    return contentParts ? (
      <RichContentRenderer parts={contentParts} />
    ) : (
      <Markdown {...markdownProps} fontSize={fontSize} variant={'chat'}>
        {message}
      </Markdown>
    );
  },
);

export default MessageContent;
