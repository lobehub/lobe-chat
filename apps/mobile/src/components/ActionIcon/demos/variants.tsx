import React from 'react';

import { ActionIcon, Space } from '@/components';
import { Sun, MoonStar } from 'lucide-react-native';

const VariantsDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon icon={Sun} variant="borderless" />
      <ActionIcon icon={Sun} variant="filled" />
      <ActionIcon icon={MoonStar} variant="outlined" />
    </Space>
  );
};

export default VariantsDemo;
