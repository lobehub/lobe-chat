import { Markdown } from '@lobehub/ui-rn';

const quotesContent = `## Blockquotes

> This is a blockquote.
> It can span multiple lines.

## Nested Blockquotes

> First level quote
> > Second level quote
> > > Third level quote

## Complex Blockquotes

> **Note:** This is an important message.
>
> You can include *formatted* text and even code: \`const x = 10\`
>
> - List items work too
> - Another item
`;

export default () => {
  return <Markdown>{quotesContent}</Markdown>;
};
