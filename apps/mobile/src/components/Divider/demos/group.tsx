import { Divider, Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text as="h4">个人信息</Text>
        <Text type="secondary">用户名：张三</Text>
        <Text type="secondary">邮箱：zhangsan@example.com</Text>
      </Flexbox>

      <Divider />

      <Flexbox gap={8}>
        <Text as="h4">账户设置</Text>
        <Text type="secondary">修改密码</Text>
        <Text type="secondary">隐私设置</Text>
      </Flexbox>

      <Divider />

      <Flexbox gap={8}>
        <Text as="h4">其他</Text>
        <Text type="secondary">关于我们</Text>
        <Text type="secondary">帮助中心</Text>
      </Flexbox>
    </Flexbox>
  );
};
