import { Flexbox, Input, Text } from '@lobehub/ui-rn';

const PrefixDemo = () => {
  return (
    <Flexbox gap={16}>
      <Input placeholder="请输入用户名" prefix={<Text>@</Text>} />
      <Input placeholder="请输入密码" prefix={<Text>🔒</Text>} secureTextEntry />
      <Input placeholder="搜索内容" prefix={<Text>🔍</Text>} />
    </Flexbox>
  );
};

export default PrefixDemo;
