import { Markdown } from '@lobehub/ui-rn';

// Demo: 标题渲染示例

const headingsContent = `# Heading Level 1

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5
`;

export default () => {
  return <Markdown>{headingsContent}</Markdown>;
};
