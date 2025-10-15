import { Flexbox, Input } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Flexbox gap={16}>
      <Input placeholder="请输入内容" />
      <Input defaultValue="预设值" />
    </Flexbox>
  );
};

export default BasicDemo;
