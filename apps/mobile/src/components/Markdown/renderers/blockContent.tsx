import { BlockContent } from 'mdast';
import { ReactNode } from 'react';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const BlockContentRenderer = ({ node, ...args }: RendererArgs<BlockContent>): ReactNode => {
  const { renderers } = useMarkdownContext();
  const {
    BlockquoteRenderer,
    CodeRenderer,
    HeadingRenderer,
    HtmlRenderer,
    ListRenderer,
    ParagraphRenderer,
    TableRenderer,
    ThematicBreakRenderer,
  } = renderers;

  switch (node.type) {
    case 'blockquote': {
      return <BlockquoteRenderer node={node} {...args} />;
    }
    case 'code': {
      return <CodeRenderer node={node} {...args} />;
    }
    case 'heading': {
      return <HeadingRenderer node={node} {...args} />;
    }
    case 'html': {
      return <HtmlRenderer node={node} {...args} />;
    }
    case 'list': {
      return <ListRenderer node={node} {...args} />;
    }
    case 'paragraph': {
      return <ParagraphRenderer node={node} {...args} />;
    }
    case 'table': {
      return <TableRenderer node={node} {...args} />;
    }
    case 'thematicBreak': {
      return <ThematicBreakRenderer node={node} {...args} />;
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      // const _: never = node;
      return null;
    }
  }
};
