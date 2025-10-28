import { Markdown } from '@lobehub/ui-rn';

const linksContent = `[GitHub](https://github.com)

[Link with title](https://github.com "GitHub Homepage")

<https://github.com>

<user@example.com>

This is [a reference link][1] and this is [another reference link][github].

[1]: https://example.com
[github]: https://github.com "GitHub"
`;

export default () => {
  return <Markdown>{linksContent}</Markdown>;
};
