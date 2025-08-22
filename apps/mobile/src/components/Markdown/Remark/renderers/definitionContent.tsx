import { DefinitionContent } from 'mdast';
import { ReactNode } from 'react';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const DefinitionContentRenderer = ({
  node,
  ...args
}: RendererArgs<DefinitionContent>): ReactNode => {
  const { renderers } = useMarkdownContext();
  const { DefinitionRenderer, FootnoteDefinitionRenderer } = renderers;

  switch (node.type) {
    case 'definition': {
      return <DefinitionRenderer node={node} {...args} />;
    }
    case 'footnoteDefinition': {
      return <FootnoteDefinitionRenderer node={node} {...args} />;
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      const _: never = node;
      return null;
    }
  }
};
