import { Node } from 'mdast';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

import Center from '../../Center';
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
    <Center style={{ marginVertical: 16 }}>
      <MathJaxSvg color={styles.textColor} fontCache={true} fontSize={styles.fontSize}>
        {`$$${node.value}$$`}
      </MathJaxSvg>
    </Center>
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
