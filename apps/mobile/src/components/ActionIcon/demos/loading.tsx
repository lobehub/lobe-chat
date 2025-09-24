import { RefreshCw } from 'lucide-react-native';
import React from 'react';

import { ActionIcon, Space } from '@/components';

const LoadingDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon icon={RefreshCw} loading />
      <ActionIcon icon={RefreshCw} loading variant="filled" />
      <ActionIcon icon={RefreshCw} loading variant="outlined" />
    </Space>
  );
};

export default LoadingDemo;
