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
      onSelect: () => Alert.alert('提示', '删除'),
      title: '删除',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">点击触发（press）</Text>
        <Dropdown options={options} trigger="press">
          <Block padding={16} variant="filled">
            <Text>点击显示菜单</Text>
          </Block>
        </Dropdown>
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">长按触发（longPress）- 默认</Text>
        <Dropdown options={options} trigger="longPress">
          <Block padding={16} variant="outlined">
            <Text>长按显示菜单</Text>
          </Block>
        </Dropdown>
      </Flexbox>
    </Flexbox>
  );
};
