import { Flexbox, Tag } from '@lobehub/ui-rn';

const BorderDemo = () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8} horizontal wrap="wrap">
        <Tag variant="borderless">Borderless 1</Tag>
        <Tag variant="borderless">Borderless 2</Tag>
      </Flexbox>

      <Flexbox gap={8} horizontal wrap="wrap">
        <Tag color="success" variant="borderless">
          Success
        </Tag>
        <Tag color="processing" variant="borderless">
          Processing
        </Tag>

        <Tag color="error" variant="borderless">
          Error
        </Tag>
        <Tag color="warning" variant="borderless">
          Warning
        </Tag>
        <Tag color="red" variant="borderless">
          Red
        </Tag>
        <Tag color="volcano" variant="borderless">
          Volcano
        </Tag>
        <Tag color="orange" variant="borderless">
          Orange
        </Tag>
        <Tag color="gold" variant="borderless">
          Gold
        </Tag>
        <Tag color="yellow" variant="borderless">
          Yellow
        </Tag>
        <Tag color="lime" variant="borderless">
          Lime
        </Tag>
        <Tag color="green" variant="borderless">
          Green
        </Tag>
        <Tag color="cyan" variant="borderless">
          Cyan
        </Tag>
        <Tag color="blue" variant="borderless">
          Blue
        </Tag>
        <Tag color="geekblue" variant="borderless">
          Geekblue
        </Tag>
        <Tag color="purple" variant="borderless">
          Purple
        </Tag>
        <Tag color="magenta" variant="borderless">
          Magenta
        </Tag>
        <Tag color="gray" variant="borderless">
          Gray
        </Tag>
      </Flexbox>
    </Flexbox>
  );
};

export default BorderDemo;
