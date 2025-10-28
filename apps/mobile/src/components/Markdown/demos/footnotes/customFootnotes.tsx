import { Markdown } from '@lobehub/ui-rn';

const footnotesContent = `1. Fast conversion: Convert web applications to desktop applications in minutes[^1]
2. Usage:
- Provides the ToDesktop Builder desktop application
- Guides users through the conversion process through step-by-step instructions[^2]

[^1]: [ToDesktop Official Website](https://www.todesktop.com/)
[^2]: [ToDesktop Basics Introduction](https://www.todesktop.com/docs/introduction/basics)
`;

export default () => {
  return (
    <Markdown enableCustomFootnotes showFootnotes>
      {footnotesContent}
    </Markdown>
  );
};
