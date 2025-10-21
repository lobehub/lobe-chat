import { Block, Center, Dropdown, Flexbox, Text } from '@lobehub/ui-rn';
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
  ];

  return (
    <Flexbox gap={24}>
      <Flexbox gap={8}>
        <Text type="secondary">上方位置</Text>
        <Flexbox gap={8} horizontal>
          <Dropdown options={options} placement="topLeft" trigger="press">
            <Block padding={12} variant="filled">
              <Text>topLeft</Text>
            </Block>
          </Dropdown>
          <Dropdown options={options} placement="top" trigger="press">
            <Block padding={12} variant="filled">
              <Text>top</Text>
            </Block>
          </Dropdown>
          <Dropdown options={options} placement="topRight" trigger="press">
            <Block padding={12} variant="filled">
              <Text>topRight</Text>
            </Block>
          </Dropdown>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">下方位置</Text>
        <Flexbox gap={8} horizontal>
          <Dropdown options={options} placement="bottomLeft" trigger="press">
            <Block padding={12} variant="outlined">
              <Text>bottomLeft</Text>
            </Block>
          </Dropdown>
          <Dropdown options={options} placement="bottom" trigger="press">
            <Block padding={12} variant="outlined">
              <Text>bottom</Text>
            </Block>
          </Dropdown>
          <Dropdown options={options} placement="bottomRight" trigger="press">
            <Block padding={12} variant="outlined">
              <Text>bottomRight</Text>
            </Block>
          </Dropdown>
        </Flexbox>
      </Flexbox>

      <Center paddingBlock={16}>
        <Text fontSize={12} type="secondary">
          点击按钮查看不同位置的菜单弹出效果
        </Text>
      </Center>
    </Flexbox>
  );
};
