import { Paragraph } from 'mdast';
import { ReactNode } from 'react';
import { View } from 'react-native';

import Text from '../../Text';
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
    <View style={{ pointerEvents: 'none' }}>
      <Text style={paragraphStyle}>
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
