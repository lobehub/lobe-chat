import { Alert, Space } from '@lobehub/ui-rn';
import React from 'react';

const TypesDemo = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert message="信息提示" type="info" />
      <Alert message="成功提示" type="success" />
      <Alert message="警告提示" type="warning" />
      <Alert message="错误提示" type="error" />
    </Space>
  );
};

export default TypesDemo;
