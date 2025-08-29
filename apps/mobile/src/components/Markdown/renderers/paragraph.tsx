import { Paragraph } from 'mdast';
import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const ParagraphRenderer = ({ node, parent }: RendererArgs<Paragraph>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  // 如果父级是 blockquote，则继承其颜色样式
  const paragraphStyle =
    parent?.type === 'blockquote'
      ? { ...styles.paragraph, color: styles.blockQuoteColor }
      : styles.paragraph;

  return (
    <Text style={paragraphStyle}>
      {node.children.map((child, idx) => (
        <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />
      ))}
    </Text>
  );
};
