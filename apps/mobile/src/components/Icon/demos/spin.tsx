import { LoaderCircle, RefreshCw, RotateCcw } from 'lucide-react-native';
import React from 'react';

import { Icon, Space } from '@/components';

const SpinDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <Icon icon={LoaderCircle} spin />
      <Icon color="#1C7ED6" icon={RefreshCw} size={28} spin />
      <Icon color="#F59F00" icon={RotateCcw} size={32} spin />
    </Space>
  );
};

export default SpinDemo;
