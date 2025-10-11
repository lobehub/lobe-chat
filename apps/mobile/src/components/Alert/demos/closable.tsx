import { Alert, Space, Toast } from '@lobehub/ui-rn';
import { Bell } from 'lucide-react-native';
import React from 'react';

const ClosableDemo = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        closable
        description="点击右上角关闭按钮即可移除提示。"
        message="可关闭提示"
        onClose={() => {
          Toast.success('已关闭提示');
        }}
        type="info"
      />
      <Alert
        closable
        closeIcon={Bell}
        description="通过 closeIcon 属性替换默认的关闭图标。"
        message="自定义关闭图标"
        type="warning"
      />
    </Space>
  );
};

export default ClosableDemo;
