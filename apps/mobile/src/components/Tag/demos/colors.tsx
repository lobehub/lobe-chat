import { Flexbox, Tag } from '@lobehub/ui-rn';

const ColorsDemo = () => {
  return (
    <Flexbox gap={8} horizontal wrap="wrap">
      {/* Preset colors */}
      <Tag color="red">Red</Tag>
      <Tag color="volcano">Volcano</Tag>
      <Tag color="orange">Orange</Tag>
      <Tag color="gold">Gold</Tag>
      <Tag color="yellow">Yellow</Tag>
      <Tag color="lime">Lime</Tag>
      <Tag color="green">Green</Tag>
      <Tag color="cyan">Cyan</Tag>
      <Tag color="blue">Blue</Tag>
      <Tag color="geekblue">Geekblue</Tag>
      <Tag color="purple">Purple</Tag>
      <Tag color="magenta">Magenta</Tag>
      <Tag color="gray">Gray</Tag>

      {/* Default (no color) */}
      <Tag>Default</Tag>
    </Flexbox>
  );
};

export default ColorsDemo;
