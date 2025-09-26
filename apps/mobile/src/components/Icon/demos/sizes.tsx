import { Icon, Space } from '@lobehub/ui-rn';
import { ZoomIn, ZoomOut } from 'lucide-react-native';
import React from 'react';

const SizesDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <Icon icon={ZoomOut} size="small" />
      <Icon icon={ZoomIn} size="middle" />
      <Icon icon={ZoomOut} size="large" />
      <Icon icon={ZoomIn} size={36} />
    </Space>
  );
};

export default SizesDemo;
