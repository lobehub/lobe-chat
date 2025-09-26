import { ActionIcon, Space } from '@lobehub/ui-rn';
import { MoonStar, Sun } from 'lucide-react-native';
import React from 'react';

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
