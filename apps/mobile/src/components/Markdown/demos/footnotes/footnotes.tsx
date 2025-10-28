import { Markdown } from '@lobehub/ui-rn';

const footnotesContent = `Here is a simple footnote[^1].

A footnote can also have multiple lines[^2].

[^1]: My reference.
[^2]: To add line breaks within a footnote, prefix new lines with 2 spaces.
`;

export default () => {
  return <Markdown>{footnotesContent}</Markdown>;
};
