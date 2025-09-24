import { Bell, BellRing } from 'lucide-react-native';
import React from 'react';

import { ActionIcon, Space } from '@/components';

const DisabledDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon disabled icon={Bell} />
      <ActionIcon disabled icon={BellRing} variant="filled" />
      <ActionIcon disabled icon={Bell} variant="outlined" />
      <ActionIcon disabled icon={BellRing} loading />
    </Space>
  );
};

export default DisabledDemo;
