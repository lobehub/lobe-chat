import { Root } from 'mdast';
import { View } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const RootRenderer = ({ node }: RendererArgs<Root>) => {
  const { renderers, styles } = useMarkdownContext();
  const { RootContentRenderer } = renderers;

  // const renderItem = ({ item: node, index }: { index: number; item: any }) => (
  //   <RootContentRenderer index={index} key={index} node={node} parent={node} />
  // );
  //
  // return (
  //   <FlashList data={node.children.filter(Boolean)} renderItem={renderItem} scrollEnabled={false} />
  // );

  return (
    <View style={styles.container}>
      {node.children.filter(Boolean).map((node, index) => (
        <RootContentRenderer index={index} key={index} node={node} parent={node} />
      ))}
    </View>
  );
};
