import { memo, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import { LogBox } from 'react-native';

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

    useEffect(() => {
      if ((global as any).__DEV__) {
        const filters = ['Text strings must be rendered within a <Text> component'];
        LogBox.ignoreLogs(filters);
        // 隐藏命令行错误
        const originalError = console.error;
        console.error = (...args) => {
          if (typeof args[0] === 'string' && filters.some((f) => args[0].includes(f))) {
            return;
          }
          originalError(...args);
        };
      }
    }, []);

    return (
      <Markdown
        allowedElements={Object.keys(mergedComponents)}
        components={mergedComponents}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
        skipHtml={true}
      >
        {children}
      </Markdown>
    );
  },
);

ReactNativeMarkdown.displayName = 'ReactNativeMarkdown';

export default ReactNativeMarkdown;
