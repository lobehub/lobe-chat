import { Definition, Root } from 'mdast';
import { useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { MarkdownContextProvider, RemarkStyles } from './context';
import { defaultRenderers } from './renderers';
import { Renderers } from './renderers/renderers';
import { RootRenderer } from './renderers/root';
import { RemarkStyleOptions, useHeading, useRemarkStyles } from './style';

const parser = unified().use(remarkParse).use(remarkGfm);

function extractDefinitions(tree: Root): Record<string, Definition> {
  const definitions: Record<string, Definition> = {};
  visit(tree, 'definition', (node: Definition) => {
    definitions[node.identifier] = node;
  });
  return definitions;
}

export type MarkdownProps = {
  customRenderers?: Partial<Renderers>;
  customStyles?: Partial<RemarkStyles>;
  fontSize?: number;
  headerMultiple?: number;
  lineHeight?: number;
  marginMultiple?: number;
  markdown: string;
};

export const Markdown = ({
  markdown,
  customRenderers,
  customStyles,
  fontSize = 16,
  headerMultiple = 1,
  lineHeight = 1.8,
  marginMultiple = 2,
}: MarkdownProps) => {
  const tree = useMemo(() => parser.parse(markdown), [markdown]);

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
  const { styles } = useRemarkStyles(options);
  const heading = useHeading(options);

  const mergedStyles = useMemo(
    () => ({
      ...styles,
      heading,
      ...customStyles,
    }),
    [styles, heading, customStyles],
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
