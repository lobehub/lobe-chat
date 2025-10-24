import { Root } from 'mdast';
import { View } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const RootRenderer = ({ node }: RendererArgs<Root>) => {
  const { renderers, styles } = useMarkdownContext();
  const { RootContentRenderer } = renderers;

  return (
    <View style={styles.container}>
      {node.children.filter(Boolean).map((node, index) => (
        <RootContentRenderer index={index} key={index} node={node} parent={node} />
      ))}
    </View>
  );
};
