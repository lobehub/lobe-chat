import { Flexbox, Select } from '@lobehub/ui-rn';
import { Apple, Coffee, Utensils } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text } from 'react-native';

export default () => {
  const [value, setValue] = useState('apple');

  const options = [
    {
      icon: Apple,
      title: '苹果',
      value: 'apple',
    },
    {
      icon: Coffee,
      title: '咖啡',
      value: 'coffee',
    },
    {
      icon: Utensils,
      title: '餐具',
      value: 'utensils',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Select
        onChange={(val) => {
          setValue(val as string);
          Alert.alert('选择', `您选择了: ${val}`);
        }}
        options={options}
        title="选择图标"
        value={value}
      />
      <Text style={{ textAlign: 'center' }}>当前选择: {value}</Text>
    </Flexbox>
  );
};
