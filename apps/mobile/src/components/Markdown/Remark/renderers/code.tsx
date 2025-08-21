import { Code } from 'mdast';
import { ReactNode } from 'react';

import Highlighter from '@/components/Highlighter';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const CodeRenderer = ({ node }: RendererArgs<Code>): ReactNode => {
  const { onCodeCopy } = useMarkdownContext();

  return (
    <Highlighter
      code={node.value}
      copyable={true}
      fullFeatured={true}
      lang={node.lang || 'text'}
      onCopy={onCodeCopy}
      showLanguage={true}
      type="compact"
    />
  );
};
