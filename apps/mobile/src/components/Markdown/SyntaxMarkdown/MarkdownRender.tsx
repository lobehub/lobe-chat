import { memo } from 'react';

import {
  useMarkdownComponents,
  useMarkdownContent,
  useMarkdownRehypePlugins,
  useMarkdownRemarkPlugins,
} from '@/components/hooks/useMarkdown';

import ReactNativeMarkdown from '../ReactNativeMarkdown';
import type { ReactNativeMarkdownProps } from '../ReactNativeMarkdown/type';

const MarkdownRender = memo<Omit<ReactNativeMarkdownProps, 'remarkPlugins'>>(
  ({ children, ...rest }) => {
    const escapedContent = useMarkdownContent(children || '');
    const remarkPlugins = useMarkdownRemarkPlugins();
    const rehypePlugins = useMarkdownRehypePlugins();
    const components = useMarkdownComponents();

    return (
      <ReactNativeMarkdown
        {...rest}
        components={components}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
      >
        {escapedContent || ''}
      </ReactNativeMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

MarkdownRender.displayName = 'MarkdownRender';

export default MarkdownRender;
