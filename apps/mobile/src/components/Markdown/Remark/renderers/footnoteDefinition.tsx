import { BlockContent, DefinitionContent, FootnoteDefinition } from 'mdast';
import { Fragment, ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useMarkdownContext } from '../context';
import { mergeStyles } from '../themes/themes';
import { RendererArgs } from './renderers';

export const FootnoteDefinitionRenderer = ({
  node,
}: RendererArgs<FootnoteDefinition>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { BlockContentRenderer, DefinitionContentRenderer } = renderers;

  const mergedStyles = mergeStyles(styles.paragraph, {
    fontWeight: '500',
    textDecorationLine: 'underline',
  });

  return (
    <View style={{ flexDirection: 'row' }}>
      <View>
        <Text style={mergedStyles}>[{node.identifier}]: </Text>
      </View>
      <View style={{ flex: 1 }}>
        {node.children.map((child, idx) => (
          <Fragment key={idx}>
            <BlockContentRenderer index={idx} node={child as BlockContent} parent={node} />
            <DefinitionContentRenderer
              index={idx}
              node={child as DefinitionContent}
              parent={node}
            />
          </Fragment>
        ))}
      </View>
    </View>
  );
};
