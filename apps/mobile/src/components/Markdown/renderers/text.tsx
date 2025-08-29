import { Text as MdText } from 'mdast';
import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const TextRenderer = ({ node, parent }: RendererArgs<MdText>): ReactNode => {
  const { styles } = useMarkdownContext();

  const value = (node.value || '').replaceAll('\n', ' ');
  if (!value) return null;

  // 如果父级是 blockquote，则继承颜色
  const textStyle =
    parent?.type === 'blockquote' ? { ...styles.text, color: styles.blockquoteColor } : styles.text;

  return <Text style={textStyle}>{value}</Text>;
};
