import { Text as MdText } from 'mdast';
import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const TextRenderer = ({ node }: RendererArgs<MdText>): ReactNode => {
  const { styles } = useMarkdownContext();

  const value = (node.value || '').replaceAll('\n', ' ');
  if (!value) return null;
  return <Text style={styles.text}>{value}</Text>;
};
