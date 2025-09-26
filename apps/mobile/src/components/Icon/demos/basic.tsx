import { Icon, Space } from '@lobehub/ui-rn';
import { Heart, MessageCircle, Star } from 'lucide-react-native';
import React from 'react';

const BasicDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <Icon icon={Heart} />
      <Icon icon={MessageCircle} />
      <Icon icon={Star} />
    </Space>
  );
};

export default BasicDemo;
