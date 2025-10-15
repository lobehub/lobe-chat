import { Flexbox, Input, Text } from '@lobehub/ui-rn';

const CompoundDemo = () => {
  return (
    <Flexbox gap={16}>
      <Text>搜索输入框</Text>
      <Text>内置搜索图标，returnKeyType为search</Text>
      <Input.Search placeholder="搜索内容..." />
      <Input.Search placeholder="搜索用户" />

      <Text>密码输入框</Text>
      <Text>支持密码显示/隐藏切换</Text>
      <Input.Password placeholder="请输入密码" />
      <Input.Password placeholder="确认密码" />

      <Text>组合使用</Text>
      <Text>常见的登录表单示例</Text>
      <Input.Search placeholder="搜索用户名..." />
      <Input.Password placeholder="输入密码" />
    </Flexbox>
  );
};

export default CompoundDemo;
