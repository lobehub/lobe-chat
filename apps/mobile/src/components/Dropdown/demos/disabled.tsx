import { Block, Dropdown, Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';
import { Alert } from 'react-native';

export default () => {
  const options = [
    {
      icon: { name: 'doc.on.doc' },
      key: 'copy',
      onSelect: () => Alert.alert('提示', '复制'),
      title: '复制',
    },
    {
      disabled: true,
      icon: { name: 'pencil' },
      key: 'edit',
      onSelect: () => Alert.alert('提示', '编辑'),
      title: '编辑（禁用）',
    },
    {
      icon: { name: 'arrow.clockwise' },
      key: 'refresh',
      onSelect: () => Alert.alert('提示', '刷新'),
      title: '刷新',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Dropdown options={options}>
        <Block padding={16} variant="filled">
          <Text>长按显示菜单（含禁用项）</Text>
        </Block>
      </Dropdown>
    </Flexbox>
  );
};
