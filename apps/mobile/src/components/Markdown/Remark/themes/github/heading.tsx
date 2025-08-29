import { Heading } from 'mdast';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useMarkdownContext } from '../../context';
import { RendererArgs } from '../../renderers';

export const HeadingRenderer = ({ node }: RendererArgs<Heading>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  return (
    <View
      style={{
        borderBottomWidth: node.depth <= 3 ? 1 : 0,
        borderColor: styles.borderColor,
      }}
    >
      <Text style={styles.heading?.(node.depth)}>
        {node.children.map((child, idx) => (
          <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />
        ))}
      </Text>
    </View>
  );
};
