import { Input } from '@lobehub/ui-rn';
import React from 'react';

import Form from '..';

const RequiredMarkDemo = () => (
  <Form initialValues={{ email: '', nickname: '' }}>
    <Form.Item
      label="Email"
      name="email"
      requiredMark
      rules={[{ message: '邮箱是必填项', required: true }]}
    >
      <Input keyboardType="email-address" placeholder="请输入邮箱地址" />
    </Form.Item>
    <Form.Item help="选填，展示在公开资料中" label="Nickname" name="nickname">
      <Input placeholder="请输入昵称" />
    </Form.Item>
  </Form>
);

export default RequiredMarkDemo;
