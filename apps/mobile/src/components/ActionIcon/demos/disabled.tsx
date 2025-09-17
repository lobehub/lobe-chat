import React from 'react';

import { ActionIcon, Space } from '@/components';
import { Bell, BellRing } from 'lucide-react-native';

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
