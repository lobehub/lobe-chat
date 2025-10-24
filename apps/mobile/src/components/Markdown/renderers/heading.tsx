import { Heading } from 'mdast';
import { ReactNode } from 'react';
import { View } from 'react-native';

import Text from '../../Text';
import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const HeadingRenderer = ({ node }: RendererArgs<Heading>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  return (
    <View style={{ pointerEvents: 'none' }}>
      <Text style={styles.heading?.(node.depth)}>
        {node.children.filter(Boolean).map((child, idx) => {
          if (child.type === 'text') {
            return child.value;
          }
          return <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />;
        })}
      </Text>
    </View>
  );
};
