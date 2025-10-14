import { Node } from 'mdast';
import { View } from 'react-native';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

interface MathNode extends Node {
  type: 'math';
  value: string;
}

interface InlineMathNode extends Node {
  type: 'inlineMath';
  value: string;
}

export const MathRenderer = ({ node }: RendererArgs<MathNode>) => {
  const { styles } = useMarkdownContext();
  return (
    <View style={{ marginVertical: 8 }}>
      <MathJaxSvg color={styles.textColor} fontCache={true} fontSize={styles.fontSize}>
        {`$$${node.value}$$`}
      </MathJaxSvg>
    </View>
  );
};

export const InlineMathRenderer = ({ node }: RendererArgs<InlineMathNode>) => {
  const { styles } = useMarkdownContext();

  return (
    <MathJaxSvg color={styles.textColor} fontCache={true} fontSize={styles.fontSize}>
      {`$${node.value}$`}
    </MathJaxSvg>
  );
};
