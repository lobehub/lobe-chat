import { memo } from 'react';

import {
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

    return (
      <ReactNativeMarkdown {...rest} rehypePlugins={rehypePlugins} remarkPlugins={remarkPlugins}>
        {escapedContent || ''}
      </ReactNativeMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

MarkdownRender.displayName = 'MarkdownRender';

export default MarkdownRender;
