import React from 'react';

import Form from '..';
import Input from '../../Input';

const urlValidator = (value?: unknown) => {
  const input = (typeof value === 'string' ? value : '').trim();
  if (!input) return;
  if (!/^https?:\/\/.+/i.test(input)) {
    return '请输入以 http:// 或 https:// 开头的链接';
  }
};

const ValidatorDemo = () => (
  <Form initialValues={{ endpoint: '' }}>
    <Form.Item
      extra="示例：https://api.lobehub.com"
      label="Endpoint"
      name="endpoint"
      rules={[{ validator: urlValidator }]}
    >
      <Input placeholder="请输入自定义服务器地址" />
    </Form.Item>
  </Form>
);

export default ValidatorDemo;
