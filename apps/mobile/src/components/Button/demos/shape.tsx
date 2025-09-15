import React from 'react';
import { Plus, Search, Upload } from 'lucide-react-native';

import { Button, Space } from '@/components';

const ShapeDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button icon={<Search />} shape="circle" size="small" type="default" />
      <Button icon={<Plus />} shape="circle" size="middle" type="dashed" />
      <Button icon={<Upload />} shape="circle" size="large" type="primary" />
    </Space>
  );
};

export default ShapeDemo;
