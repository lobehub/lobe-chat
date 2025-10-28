import { Markdown } from '@lobehub/ui-rn';

const footnotesContent = `## Simple Footnotes

Here is a simple footnote[^1].

A footnote can also have multiple lines[^2].

You can use numbers[^3] or words[^note] for footnotes.

## Multiple References

This sentence has two footnotes[^4][^5].

You can reference the same footnote multiple times[^4].

[^1]: My reference.
[^2]: To add line breaks within a footnote, prefix new lines with 2 spaces.
[^3]: This is a numbered footnote.
[^note]: This is a named footnote.
[^4]: First footnote that appears twice.
[^5]: Another footnote.
`;

export default () => {
  return <Markdown>{footnotesContent}</Markdown>;
};
