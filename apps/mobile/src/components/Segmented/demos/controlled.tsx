import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';
import { Alert } from 'react-native';

export default () => {
  const [value, setValue] = useState('ios');

  const handleChange = (newValue: string | number) => {
    setValue(newValue as string);
    Alert.alert('提示', `选择了: ${newValue}`);
  };

  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">受控模式</Text>
        <Segmented
          onChange={handleChange}
          options={[
            { label: 'iOS', value: 'ios' },
            { label: 'Android', value: 'android' },
            { label: 'Web', value: 'web' },
          ]}
          value={value}
        />
      </Flexbox>

      <Flexbox gap={8}>
        <Text>当前选中: {value}</Text>
      </Flexbox>
    </Flexbox>
  );
};
