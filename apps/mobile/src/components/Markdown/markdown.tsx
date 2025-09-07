import { Definition, Root } from 'mdast';
import { useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import remarkGfm from 'remark-gfm';
// 仅用于解析数学公式
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { MarkdownContextProvider, RemarkStyles } from './context';
import { defaultRenderers } from './renderers';
import { Renderers } from './renderers/renderers';
import { RootRenderer } from './renderers/root';
import { RemarkStyleOptions, useRemarkStyles } from './style';

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm, {
    singleTilde: false,
  })
  .use(remarkMath);

function extractDefinitions(tree: Root): Record<string, Definition> {
  const definitions: Record<string, Definition> = {};
  visit(tree, 'definition', (node: Definition) => {
    definitions[node.identifier] = node;
  });
  return definitions;
}

export type MarkdownProps = {
  children: string;
  customRenderers?: Partial<Renderers>;
  customStyles?: Partial<RemarkStyles>;
  fontSize?: number;
  headerMultiple?: number;
  lineHeight?: number;
  marginMultiple?: number;
};

export const Markdown = ({
  children,
  customRenderers,
  customStyles,
  fontSize = 14,
  headerMultiple = 1,
  lineHeight = 1.8,
  marginMultiple = 2,
}: MarkdownProps) => {
  const tree = useMemo(() => parser.parse(children), [children]);

  const renderers = useMemo(
    () => ({
      ...defaultRenderers,
      ...customRenderers,
    }),
    [customRenderers],
  );
  const definitions = useMemo(() => extractDefinitions(tree), [tree]);

  const [contentSize, setContentSize] = useState<{
    height: number;
    width: number;
  }>({ height: 0, width: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContentSize({ height, width });
  };

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
    <View onLayout={onLayout} style={{ flex: 1 }}>
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
};
