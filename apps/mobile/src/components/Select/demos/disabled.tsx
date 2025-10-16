import { Flexbox, Select } from '@lobehub/ui-rn';
import { Heart } from 'lucide-react-native';
import React from 'react';

export default () => {
  const options = [
    {
      icon: Heart,
      title: '选项 1',
      value: '1',
    },
    {
      icon: Heart,
      title: '选项 2',
      value: '2',
    },
    {
      disabled: true,
      icon: Heart,
      title: '禁用选项',
      value: '3',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Select disabled options={options} title="禁用的选择器" />
      <Select options={options} title="部分选项禁用" />
    </Flexbox>
  );
};
