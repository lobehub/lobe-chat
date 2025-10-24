import { BlockContent, DefinitionContent, List, ListItem } from 'mdast';
import { Fragment, ReactNode, useMemo } from 'react';
import { View } from 'react-native';

import Text from '../../Text';
import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const ListRenderer = ({ node }: RendererArgs<List>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { ListItemRenderer } = renderers;

  return (
    <View style={[styles.container, styles.list]}>
      {node.children.filter(Boolean).map((child, idx) => (
        <ListItemRenderer index={idx} key={idx} node={child} parent={node} />
      ))}
    </View>
  );
};

export const ListItemRenderer = ({ node, index, parent }: RendererArgs<ListItem>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { BlockContentRenderer, DefinitionContentRenderer } = renderers;

  const list = parent?.type === 'list' ? (parent as List) : null;
  const itemNumber = (list?.start ?? 1) + (index ?? 0);

  const markerStyle = useMemo(() => {
    const defaultStyle = [styles.paragraph, { fontWeight: '400' }];
    const firstItem = node.children[0];
    if (!firstItem) return defaultStyle;
    if (firstItem.type === 'heading') {
      return styles.heading?.(firstItem.depth);
    }
    return defaultStyle;
  }, [styles, node]);

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ marginRight: 5 }}>
        {list?.ordered ? (
          <Text style={[markerStyle as any, { color: styles.listMarkerColor }]}>{itemNumber}.</Text>
        ) : (
          <Text style={[markerStyle as any, { opacity: 0.5 }]}>-</Text>
        )}
      </View>
      <View style={styles.listItem}>
        {node.children.filter(Boolean).map((child, idx) => (
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
