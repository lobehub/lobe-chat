import { Flexbox, Select } from '@lobehub/ui-rn';
import { Smile } from 'lucide-react-native';
import React from 'react';

export default () => {
  const options = [
    {
      icon: Smile,
      title: '选项 1',
      value: '1',
    },
    {
      icon: Smile,
      title: '选项 2',
      value: '2',
    },
    {
      icon: Smile,
      title: '选项 3',
      value: '3',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Select options={options} size="small" title="小尺寸" />
      <Select options={options} size="middle" title="中等尺寸" />
      <Select options={options} size="large" title="大尺寸" />
    </Flexbox>
  );
};
