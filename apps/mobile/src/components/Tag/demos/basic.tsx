import { Flexbox, Tag } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Flexbox gap={8} horizontal wrap="wrap">
      <Tag>React</Tag>
      <Tag>TypeScript</Tag>
      <Tag>JavaScript</Tag>
      <Tag>React Native</Tag>
    </Flexbox>
  );
};

export default BasicDemo;
