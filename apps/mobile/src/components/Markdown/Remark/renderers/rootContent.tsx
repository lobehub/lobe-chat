import { RootContent } from 'mdast';
import { ReactNode } from 'react';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

export const RootContentRenderer = ({ node, ...args }: RendererArgs<RootContent>): ReactNode => {
  const { renderers } = useMarkdownContext();
  const {
    BlockquoteRenderer,
    BreakRenderer,
    CodeRenderer,
    DefinitionRenderer,
    DeleteRenderer,
    EmphasisRenderer,
    FootnoteDefinitionRenderer,
    FootnoteReferenceRenderer,
    HeadingRenderer,
    HtmlRenderer,
    ImageRenderer,
    ImageReferenceRenderer,
    InlineCodeRenderer,
    LinkRenderer,
    LinkReferenceRenderer,
    ListRenderer,
    ListItemRenderer,
    ParagraphRenderer,
    StrongRenderer,
    TextRenderer,
    TableRenderer,
    TableCellRenderer,
    TableRowRenderer,
    ThematicBreakRenderer,
    YamlRenderer,
  } = renderers;

  switch (node.type) {
    case 'blockquote': {
      return <BlockquoteRenderer node={node} {...args} />;
    }
    case 'break': {
      return <BreakRenderer node={node} {...args} />;
    }
    case 'code': {
      return <CodeRenderer node={node} {...args} />;
    }
    case 'definition': {
      return <DefinitionRenderer node={node} {...args} />;
    }
    case 'delete': {
      return <DeleteRenderer node={node} {...args} />;
    }
    case 'emphasis': {
      return <EmphasisRenderer node={node} {...args} />;
    }
    case 'footnoteDefinition': {
      return <FootnoteDefinitionRenderer node={node} {...args} />;
    }
    case 'footnoteReference': {
      return <FootnoteReferenceRenderer node={node} {...args} />;
    }
    case 'heading': {
      return <HeadingRenderer node={node} {...args} />;
    }
    case 'html': {
      return <HtmlRenderer node={node} {...args} />;
    }
    case 'image': {
      return <ImageRenderer node={node} {...args} />;
    }
    case 'imageReference': {
      return <ImageReferenceRenderer node={node} {...args} />;
    }
    case 'inlineCode': {
      return <InlineCodeRenderer node={node} {...args} />;
    }
    case 'link': {
      return <LinkRenderer node={node} {...args} />;
    }
    case 'linkReference': {
      return <LinkReferenceRenderer node={node} {...args} />;
    }
    case 'list': {
      return <ListRenderer node={node} {...args} />;
    }
    case 'listItem': {
      return <ListItemRenderer node={node} {...args} />;
    }
    case 'paragraph': {
      return <ParagraphRenderer node={node} {...args} />;
    }
    case 'strong': {
      return <StrongRenderer node={node} {...args} />;
    }
    case 'table': {
      return <TableRenderer node={node} {...args} />;
    }
    case 'tableCell': {
      return <TableCellRenderer node={node} {...args} rowIndex={0} />;
    }
    case 'tableRow': {
      return <TableRowRenderer node={node} {...args} />;
    }
    case 'text': {
      return <TextRenderer node={node} {...args} />;
    }
    case 'thematicBreak': {
      return <ThematicBreakRenderer node={node} {...args} />;
    }
    case 'yaml': {
      return <YamlRenderer node={node} {...args} />;
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      const _: never = node;
      return null;
    }
  }
};
