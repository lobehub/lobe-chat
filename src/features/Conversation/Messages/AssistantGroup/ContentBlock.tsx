import { AssistantContentBlock } from '@lobechat/types';
import { MarkdownProps } from '@lobehub/ui';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LOADING_FLAT } from '@/const/message';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { MarkdownElement, markdownElements } from '../../MarkdownElements';
import { messageStateSelectors, useConversationStore } from '../../store';
import ImageFileListViewer from '../components/ImageFileListViewer';
import Reasoning from '../components/Reasoning';
import ErrorContent from './Error';
import MessageContent from './MessageContent';
import { Tools } from './Tools';

const rehypePlugins = markdownElements
  .map((element: MarkdownElement) => element.rehypePlugin)
  .filter(Boolean);
const remarkPlugins = markdownElements
  .map((element: MarkdownElement) => element.remarkPlugin)
  .filter(Boolean);

interface ContentBlockProps extends AssistantContentBlock {
  index: number;
}

export const ContentBlock = memo<ContentBlockProps>((props) => {
  const { id, tools, content, imageList, reasoning, error } = props;
  const showImageItems = !!imageList && imageList.length > 0;
  const isReasoning = useConversationStore(messageStateSelectors.isMessageInReasoning(id));
  const hasTools = tools && tools.length > 0;
  const showReasoning =
    (!!reasoning && reasoning.content?.trim() !== '') || (!reasoning && isReasoning);

  const { transitionMode, highlighterTheme, mermaidTheme, fontSize } = useUserStore(
    userGeneralSettingsSelectors.config,
  );

  const generating = useConversationStore(messageStateSelectors.isMessageGenerating(id));

  const animated = transitionMode === 'fadeIn' && generating;

  const components = useMemo(
    () =>
      Object.fromEntries(
        markdownElements.map((element: MarkdownElement) => {
          const Component = element.Component;

          return [element.tag, (props: any) => <Component {...props} id={id} />];
        }),
      ),
    [id],
  );

  const markdownProps: Omit<MarkdownProps, 'className' | 'style' | 'children'> = useMemo(
    () => ({
      animated,
      componentProps: {
        highlight: {
          fullFeatured: true,
          theme: highlighterTheme,
        },
        mermaid: { theme: mermaidTheme },
      },
      components,
      enableCustomFootnotes: true,
      fontSize,
      rehypePlugins,
      remarkPlugins,
    }),
    [animated, components, highlighterTheme, mermaidTheme, fontSize],
  );

  if (error && (content === LOADING_FLAT || !content))
    return <ErrorContent error={error} id={id} />;

  return (
    <Flexbox gap={8} id={id}>
      {showReasoning && <Reasoning {...reasoning} id={id} />}

      {/* Content - markdown text */}
      <MessageContent content={content} hasTools={hasTools} markdownProps={markdownProps} />

      {/* Image files */}
      {showImageItems && <ImageFileListViewer items={imageList} />}

      {/* Tools */}
      {hasTools && <Tools messageId={id} tools={tools} />}
    </Flexbox>
  );
});
