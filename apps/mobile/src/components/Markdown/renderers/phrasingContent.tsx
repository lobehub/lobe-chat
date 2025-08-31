import { PhrasingContent } from 'mdast';
import { ReactNode } from 'react';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

// 扩展 PhrasingContent 类型以支持行内数学公式
type ExtendedPhrasingContent = PhrasingContent | { type: 'inlineMath'; value: string };

export const PhrasingContentRenderer = ({
  node,
  ...args
}: RendererArgs<ExtendedPhrasingContent>): ReactNode => {
  const { renderers } = useMarkdownContext();
  const {
    BreakRenderer,
    DeleteRenderer,
    EmphasisRenderer,
    FootnoteReferenceRenderer,
    HtmlRenderer,
    ImageRenderer,
    ImageReferenceRenderer,
    InlineCodeRenderer,
    InlineMathRenderer,
    LinkRenderer,
    LinkReferenceRenderer,
    StrongRenderer,
    TextRenderer,
  } = renderers;

  switch (node.type) {
    case 'break': {
      return <BreakRenderer node={node} {...args} />;
    }
    case 'delete': {
      return <DeleteRenderer node={node} {...args} />;
    }
    case 'emphasis': {
      return <EmphasisRenderer node={node} {...args} />;
    }
    case 'footnoteReference': {
      return <FootnoteReferenceRenderer node={node} {...args} />;
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
    case 'inlineMath': {
      return <InlineMathRenderer node={node} {...args} />;
    }
    case 'link': {
      return <LinkRenderer node={node} {...args} />;
    }
    case 'linkReference': {
      return <LinkReferenceRenderer node={node} {...args} />;
    }
    case 'strong': {
      return <StrongRenderer node={node} {...args} />;
    }
    case 'text': {
      return <TextRenderer node={node} {...args} />;
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      const _: never = node;
      return null;
    }
  }
};
