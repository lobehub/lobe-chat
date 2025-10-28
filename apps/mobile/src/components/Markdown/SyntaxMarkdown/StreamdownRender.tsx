import { marked } from 'marked';
import { memo, useId, useMemo } from 'react';
import { View } from 'react-native';

import {
  useMarkdownComponents,
  useMarkdownContent,
  useMarkdownRehypePlugins,
  useMarkdownRemarkPlugins,
} from '@/components/hooks/useMarkdown';

import ReactNativeMarkdown from '../ReactNativeMarkdown';
import type { ReactNativeMarkdownProps } from '../ReactNativeMarkdown/type';

const parseMarkdownIntoBlocks = (markdown: string): string[] => {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
};

const StreamdownBlock = memo<ReactNativeMarkdownProps>(
  ({ children, ...rest }) => {
    return <ReactNativeMarkdown {...rest}>{children}</ReactNativeMarkdown>;
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

StreamdownBlock.displayName = 'StreamdownBlock';

export const StreamdownRender = memo<Omit<ReactNativeMarkdownProps, 'remarkPlugins'>>(
  ({ children, ...rest }) => {
    const escapedContent = useMarkdownContent(children || '');
    const remarkPlugins = useMarkdownRemarkPlugins();
    const rehypePlugins = useMarkdownRehypePlugins();
    const components = useMarkdownComponents();
    const generatedId = useId();
    const blocks = useMemo(
      () => parseMarkdownIntoBlocks(typeof escapedContent === 'string' ? escapedContent : ''),
      [escapedContent],
    );
    return (
      <View pointerEvents={'box-none'}>
        {blocks.map((block, index) => (
          <StreamdownBlock
            components={components}
            key={`${generatedId}-block_${index}`}
            rehypePlugins={rehypePlugins}
            remarkPlugins={remarkPlugins}
            {...rest}
          >
            {block}
          </StreamdownBlock>
        ))}
      </View>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

StreamdownRender.displayName = 'StreamdownRender';

export default StreamdownRender;
