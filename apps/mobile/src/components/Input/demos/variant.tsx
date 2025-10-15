import { Flexbox, Input, Text } from '@lobehub/ui-rn';

const VariantDemo = () => {
  return (
    <Flexbox gap={16}>
      <Text>Filled</Text>
      <Text>有背景和内边距，适合多数表单场景</Text>
      <Input placeholder="请输入内容" variant={'filled'} />
      <Input.Search placeholder="搜索内容..." variant={'filled'} />
      <Input.Password placeholder="请输入密码" variant={'filled'} />

      <Text>Outlined（描边）</Text>
      <Text>带边框描边，适合需要更明确边界的输入框</Text>
      <Input placeholder="请输入内容" variant="outlined" />
      <Input.Search placeholder="搜索内容..." variant="outlined" />
      <Input.Password placeholder="请输入密码" variant="outlined" />

      <Text>Borderless（无底色）</Text>
      <Text>无背景与圆角，常用于列表或紧凑布局</Text>
      <Input placeholder="请输入内容" variant="borderless" />
      <Input.Search placeholder="搜索内容..." variant="borderless" />
      <Input.Password placeholder="请输入密码" variant="borderless" />
    </Flexbox>
  );
};

export default VariantDemo;
