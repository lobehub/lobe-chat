import { ZoomIn, ZoomOut } from 'lucide-react-native';
import React from 'react';

import { ActionIcon, Space } from '@/components';

const SizesDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon icon={ZoomOut} size="small" />
      <ActionIcon icon={ZoomIn} size="middle" />
      <ActionIcon icon={ZoomOut} size="large" />
      <ActionIcon icon={ZoomIn} size={32} />
    </Space>
  );
};

export default SizesDemo;
