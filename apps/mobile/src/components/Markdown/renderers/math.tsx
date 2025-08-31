import { Node } from 'mdast';
import React from 'react';
import { View } from 'react-native';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

import { RendererArgs } from './renderers';
import { useMarkdownContext } from '../context';

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
      <MathJaxSvg
        color={styles.textColor}
        fontSize={styles.fontSize}
        style={{
          flex: 1,
        }}
      >
        {`$$${node.value}$$`}
      </MathJaxSvg>
    </View>
  );
};

export const InlineMathRenderer = ({ node }: RendererArgs<InlineMathNode>) => {
  const { styles } = useMarkdownContext();

  return (
    <MathJaxSvg
      color={styles.textColor}
      fontSize={styles.fontSize}
      style={{
        backgroundColor: 'transparent',
      }}
    >
      {`$$${node.value}$$`}
    </MathJaxSvg>
  );
};
