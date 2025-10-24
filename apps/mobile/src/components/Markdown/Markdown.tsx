import { remarkBr } from '@lobehub/ui/es/Markdown/plugins/remarkBr';
import { preprocessMarkdownContent } from '@lobehub/ui/es/hooks/useMarkdown/utils';
import { Definition, Root } from 'mdast';
import { memo, useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import remarkBreaks from 'remark-breaks';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkGfm from 'remark-gfm';
// 仅用于解析数学公式
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { MarkdownContextProvider } from './context';
import { defaultRenderers } from './renderers';
import { RootRenderer } from './renderers/root';
import { RemarkStyleOptions, useRemarkStyles } from './style';
import type { MarkdownProps } from './type';

const parser = unified()
  .use(remarkParse)
  .use(remarkCjkFriendly)
  .use(remarkBr)
  .use(remarkGfm, {
    singleTilde: false,
  })
  .use(remarkMath)
  .use(remarkBreaks);

function extractDefinitions(tree: Root): Record<string, Definition> {
  const definitions: Record<string, Definition> = {};
  visit(tree, 'definition', (node: Definition) => {
    definitions[node.identifier] = node;
  });
  return definitions;
}

const Markdown = memo<MarkdownProps>(
  ({
    children,
    customRenderers,
    customStyles,
    fontSize = 14,
    headerMultiple = 0.25,
    lineHeight = 1.6,
    marginMultiple = 1,
  }) => {
    const tree = useMemo(() => parser.parse(preprocessMarkdownContent(children)), [children]);

    const renderers = useMemo(
      () => ({
        ...defaultRenderers,
        ...customRenderers,
      }),
      [customRenderers],
    );
    const definitions = useMemo(() => extractDefinitions(tree), [tree]);

    const [contentSize, setContentSize] = useState<{ height: number; width: number }>({
      height: 0,
      width: 0,
    });
    const onLayout = useCallback(
      (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setContentSize((prev) =>
          prev.height === height && prev.width === width ? prev : { height, width },
        );
      },
      [setContentSize],
    );

    const options: RemarkStyleOptions = { fontSize, headerMultiple, lineHeight, marginMultiple };
    const remarkStyles = useRemarkStyles(options);

    const mergedStyles = useMemo(
      () => ({
        ...remarkStyles,
        ...customStyles,
      }),
      [remarkStyles, customStyles],
    );

    return (
      <View onLayout={onLayout} style={{ pointerEvents: 'box-none' }}>
        <MarkdownContextProvider
          contentSize={contentSize}
          definitions={definitions}
          renderers={renderers}
          styles={mergedStyles}
          tree={tree}
        >
          <RootRenderer node={tree} />
        </MarkdownContextProvider>
      </View>
    );
  },
);

Markdown.displayName = 'Markdown';

export default Markdown;
