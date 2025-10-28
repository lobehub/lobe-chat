import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

import type { ReactNativeMarkdownProps } from './type';
import { useComponents } from './useComponents';

const ReactNativeMarkdown = memo<ReactNativeMarkdownProps>(
  ({ children, components, remarkPlugins, rehypePlugins }) => {
    const defaultComponents = useComponents();
    const mergedComponents = useMemo(
      () => ({
        ...defaultComponents,
        ...components,
      }),
      [components],
    );
    return (
      <ReactMarkdown
        components={mergedComponents}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
      >
        {children}
      </ReactMarkdown>
    );
  },
);

ReactNativeMarkdown.displayName = 'ReactNativeMarkdown';

export default ReactNativeMarkdown;
