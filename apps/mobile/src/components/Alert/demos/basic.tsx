import { Alert, Space } from '@lobehub/ui-rn';
import React from 'react';

const BasicDemo = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert message="默认提示" />
      <Alert
        description="支持额外的描述信息，用于说明当前的系统状态或指导用户后续操作。"
        message="带描述的提示"
      />
    </Space>
  );
};

export default BasicDemo;
