import { Paragraph } from 'mdast';
import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const ParagraphRenderer = ({ node }: RendererArgs<Paragraph>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  return (
    <Text style={styles.paragraph}>
      {node.children.map((child, idx) => (
        <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />
      ))}
    </Text>
  );
};
