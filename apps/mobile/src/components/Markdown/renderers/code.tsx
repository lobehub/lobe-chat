import { Highlighter } from '@lobehub/ui-rn';
import { Code } from 'mdast';
import { ReactNode } from 'react';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

// const countLines = (str: string): number => {
//   const regex = /\n/g;
//   const matches = str.match(regex);
//   return matches ? matches.length : 1;
// };

export const CodeRenderer = ({ node }: RendererArgs<Code>): ReactNode => {
  const { styles } = useMarkdownContext();
  // const code = node.value;
  // const isSingleLine = countLines(code) <= 1 && code.length <= 32;

  return (
    <Highlighter
      code={node.value}
      copyable={true}
      fullFeatured
      lang={node.lang || 'text'}
      showLanguage={true}
      style={styles.blockCode}
    />
  );
};
