import { Flexbox, Tag, Text } from '@lobehub/ui-rn';

const VariantsDemo = () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Filled (默认)
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag variant="filled">Default</Tag>
          <Tag color="info" variant="filled">
            Info
          </Tag>
          <Tag color="success" variant="filled">
            Success
          </Tag>
          <Tag color="error" variant="filled">
            Error
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Outlined
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag variant="outlined">Default</Tag>
          <Tag color="info" variant="outlined">
            Info
          </Tag>
          <Tag color="success" variant="outlined">
            Success
          </Tag>
          <Tag color="error" variant="outlined">
            Error
          </Tag>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text fontSize={12} type="secondary">
          Borderless
        </Text>
        <Flexbox gap={8} horizontal wrap="wrap">
          <Tag variant="borderless">Default</Tag>
          <Tag color="info" variant="borderless">
            Info
          </Tag>
          <Tag color="success" variant="borderless">
            Success
          </Tag>
          <Tag color="error" variant="borderless">
            Error
          </Tag>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default VariantsDemo;
