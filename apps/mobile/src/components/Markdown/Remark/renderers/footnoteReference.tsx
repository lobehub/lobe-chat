import { FootnoteReference } from 'mdast';
import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const FootnoteReferenceRenderer = ({ node }: RendererArgs<FootnoteReference>): ReactNode => {
  const { styles } = useMarkdownContext();
  return <Text style={styles.footnoteReference}>[{node.identifier}]</Text>;
};
