import { Flame, Palette, Sparkles } from 'lucide-react-native';
import React from 'react';

import { Icon, Space } from '@/components';

const ColorsDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <Icon color="#FF6B6B" icon={Flame} />
      <Icon color="#1C7ED6" icon={Palette} />
      <Icon color="#40C057" icon={Sparkles} />
    </Space>
  );
};

export default ColorsDemo;
