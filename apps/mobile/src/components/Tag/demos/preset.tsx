import { Flexbox, Tag } from '@lobehub/ui-rn';

const PresetDemo = () => {
  return (
    <Flexbox gap={8} horizontal wrap="wrap">
      <Tag color="success">Success</Tag>
      <Tag color="processing">Processing</Tag>
      <Tag color="error">Error</Tag>
      <Tag color="warning">Warning</Tag>
      <Tag color="info">Info</Tag>
      <Tag>Default</Tag>
    </Flexbox>
  );
};

export default PresetDemo;
