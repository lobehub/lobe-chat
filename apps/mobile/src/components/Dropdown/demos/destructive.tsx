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
      icon: { name: 'pencil' },
      key: 'edit',
      onSelect: () => Alert.alert('提示', '编辑'),
      title: '编辑',
    },
    {
      destructive: true,
      icon: { name: 'trash' },
      key: 'delete',
      onSelect: () => Alert.alert('警告', '删除操作'),
      title: '删除',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Dropdown options={options}>
        <Block padding={16} variant="filled">
          <Text>长按显示菜单（含破坏性操作）</Text>
        </Block>
      </Dropdown>
    </Flexbox>
  );
};
