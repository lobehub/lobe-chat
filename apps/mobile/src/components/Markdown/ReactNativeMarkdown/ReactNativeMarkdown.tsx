import React, { memo, useMemo } from 'react';
import Markdown from 'react-markdown';

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
      <Markdown
        allowedElements={Object.keys(mergedComponents)}
        components={mergedComponents}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
      >
        {children}
      </Markdown>
    );
  },
);

ReactNativeMarkdown.displayName = 'ReactNativeMarkdown';

export default ReactNativeMarkdown;
