import { Flexbox, Tag, Text } from '@lobehub/ui-rn';

const HexColorDemo = () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Filled Hex Colors
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag color="#1890ff">Blue</Tag>
          <Tag color="#52c41a">Green</Tag>
          <Tag color="#fa8c16">Orange</Tag>
          <Tag color="#eb2f96">Pink</Tag>
          <Tag color="#722ed1">Purple</Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Outlined Hex Colors
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag color="#1890ff" variant="outlined">
            Blue
          </Tag>
          <Tag color="#52c41a" variant="outlined">
            Green
          </Tag>
          <Tag color="#fa8c16" variant="outlined">
            Orange
          </Tag>
          <Tag color="#eb2f96" variant="outlined">
            Pink
          </Tag>
          <Tag color="#722ed1" variant="outlined">
            Purple
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Borderless Hex Colors
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag color="#1890ff" variant="borderless">
            Blue
          </Tag>
          <Tag color="#52c41a" variant="borderless">
            Green
          </Tag>
          <Tag color="#fa8c16" variant="borderless">
            Orange
          </Tag>
          <Tag color="#eb2f96" variant="borderless">
            Pink
          </Tag>
          <Tag color="#722ed1" variant="borderless">
            Purple
          </Tag>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default HexColorDemo;
