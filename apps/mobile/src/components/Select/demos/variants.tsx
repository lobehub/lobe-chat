import { Flexbox, Select } from '@lobehub/ui-rn';
import { Star } from 'lucide-react-native';
import React from 'react';

export default () => {
  const options = [
    {
      icon: Star,
      title: '选项 1',
      value: '1',
    },
    {
      icon: Star,
      title: '选项 2',
      value: '2',
    },
    {
      icon: Star,
      title: '选项 3',
      value: '3',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Select options={options} title="Filled" variant="filled" />
      <Select options={options} title="Outlined" variant="outlined" />
      <Select options={options} title="Borderless" variant="borderless" />
    </Flexbox>
  );
};
