import { Block, Dropdown, Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';
import { Alert } from 'react-native';

export default () => {
  const options = [
    {
      key: 'option1',
      onSelect: () => Alert.alert('提示', '选项 1'),
      title: '选项 1',
    },
    {
      key: 'option2',
      onSelect: () => Alert.alert('提示', '选项 2'),
      title: '选项 2',
    },
    {
      key: 'option3',
      onSelect: () => Alert.alert('提示', '选项 3'),
      title: '选项 3',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Dropdown options={options}>
        <Block padding={16} variant="outlined">
          <Text>长按显示菜单（无图标）</Text>
        </Block>
      </Dropdown>
    </Flexbox>
  );
};
