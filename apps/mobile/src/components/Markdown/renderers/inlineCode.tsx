import { InlineCode } from 'mdast';
import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const InlineCodeRenderer = ({ node }: RendererArgs<InlineCode>): ReactNode => {
  const { styles } = useMarkdownContext();

  return <Text style={styles.inlineCode}>{node.value}</Text>;
};
