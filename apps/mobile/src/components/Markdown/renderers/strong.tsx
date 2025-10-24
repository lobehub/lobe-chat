import { Strong } from 'mdast';
import { ReactNode } from 'react';

import Text from '../../Text';
import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const StrongRenderer = ({ node }: RendererArgs<Strong>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  return (
    <Text style={styles.strong}>
      {node.children.filter(Boolean).map((child, idx) => (
        <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />
      ))}
    </Text>
  );
};
