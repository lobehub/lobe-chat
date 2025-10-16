import { Heading } from 'mdast';
import { ReactNode } from 'react';

import Text from '../../Text';
import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const HeadingRenderer = ({ node }: RendererArgs<Heading>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  return (
    <Text style={styles.heading?.(node.depth)}>
      {node.children.map((child, idx) => {
        if (child.type === 'text') {
          return child.value;
        }
        return <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />;
      })}
    </Text>
  );
};
