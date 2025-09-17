import React from 'react';

import { Icon, Space } from '@/components';
import { ZoomIn, ZoomOut } from 'lucide-react-native';

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
