import { Code } from 'mdast';
import { ReactNode } from 'react';

import Highlighter from '@/components/Highlighter';

import { RendererArgs } from './renderers';

export const CodeRenderer = ({ node }: RendererArgs<Code>): ReactNode => {
  return (
    <Highlighter
      code={node.value}
      copyable={true}
      fullFeatured={true}
      lang={node.lang || 'text'}
      showLanguage={true}
      type="compact"
    />
  );
};
