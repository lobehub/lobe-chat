import { BlockContent, Blockquote, DefinitionContent } from 'mdast';
import { Fragment, ReactNode } from 'react';
import { View } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const BlockquoteRenderer = ({ node }: RendererArgs<Blockquote>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { BlockContentRenderer, DefinitionContentRenderer } = renderers;

  return (
    <View style={[styles.container, styles.blockQuote]}>
      {node.children.filter(Boolean).map((child, idx) => (
        <Fragment key={idx}>
          <BlockContentRenderer index={idx} node={child as BlockContent} parent={node} />
          <DefinitionContentRenderer index={idx} node={child as DefinitionContent} parent={node} />
        </Fragment>
      ))}
    </View>
  );
};
