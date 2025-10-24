import { Emphasis } from 'mdast';
import { ReactNode } from 'react';

import Text from '../../Text';
import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const EmphasisRenderer = ({ node }: RendererArgs<Emphasis>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  return (
    <Text style={styles.emphasis}>
      {node.children.filter(Boolean).map((child, idx) => (
        <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />
      ))}
    </Text>
  );
};
