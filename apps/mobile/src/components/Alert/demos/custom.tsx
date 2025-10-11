import { Alert, Button, Space } from '@lobehub/ui-rn';
import { ShieldCheck } from 'lucide-react-native';
import React from 'react';

const CustomDemo = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        action={
          <Button size="small" type="primary">
            立即处理
          </Button>
        }
        description="支持在提示中内嵌操作按钮或链接，引导用户进行下一步操作。"
        icon={<ShieldCheck color="#1677ff" size={20} />}
        message="内嵌操作"
        type="info"
      />

      <Alert
        description="通过 showIcon=false 可以隐藏左侧的语义图标，当内容更紧凑时使用。"
        message="隐藏图标"
        showIcon={false}
        type="success"
      />
    </Space>
  );
};

export default CustomDemo;
