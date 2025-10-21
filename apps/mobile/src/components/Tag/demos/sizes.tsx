import { Flexbox, Tag, Text } from '@lobehub/ui-rn';

const SizesDemo = () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Small
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag size="small">Small Tag</Tag>
          <Tag color="blue" size="small">
            React
          </Tag>
          <Tag color="success" size="small">
            Success
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Medium (默认)
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag size="medium">Medium Tag</Tag>
          <Tag color="blue" size="medium">
            TypeScript
          </Tag>
          <Tag color="warning" size="medium">
            Warning
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Large
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag size="large">Large Tag</Tag>
          <Tag color="blue" size="large">
            JavaScript
          </Tag>
          <Tag color="error" size="large">
            Error
          </Tag>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default SizesDemo;
