import { BlockContent, Blockquote, DefinitionContent } from 'mdast';
import { Fragment, ReactNode } from 'react';
import { View } from 'react-native';

import { useMarkdownContext } from '../context';
import { mergeStyles } from '../themes/themes';
import { RendererArgs } from './renderers';

export const BlockquoteRenderer = ({ node }: RendererArgs<Blockquote>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { BlockContentRenderer, DefinitionContentRenderer } = renderers;

  const style = mergeStyles(styles.container, styles.blockquote);

  return (
    <View style={style}>
      {node.children.map((child, idx) => (
        <Fragment key={idx}>
          <BlockContentRenderer index={idx} node={child as BlockContent} parent={node} />
          <DefinitionContentRenderer index={idx} node={child as DefinitionContent} parent={node} />
        </Fragment>
      ))}
    </View>
  );
};
