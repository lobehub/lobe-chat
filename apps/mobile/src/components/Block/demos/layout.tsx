import { Block, Flexbox } from '@lobehub/ui-rn';
import React from 'react';
import { Text } from 'react-native';

export default () => {
  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Block 布局示例</Text>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>水平布局</Text>
      <Block align="center" horizontal justify="space-between" padding={16} variant="outlined">
        <Text>左侧</Text>
        <Text>中间</Text>
        <Text>右侧</Text>
      </Block>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>垂直布局 - 居中对齐</Text>
      <Block align="center" justify="center" padding={24} variant={'outlined'}>
        <Text style={{ marginBottom: 8 }}>标题</Text>
        <Text style={{ color: '#666', fontSize: 12 }}>副标题</Text>
      </Block>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>卡片式布局</Text>
      <Flexbox gap={12} horizontal justify={'space-between'}>
        <Block align={'center'} flex={1} justify={'center'} padding={12} variant={'outlined'}>
          <Text style={{ fontSize: 20, marginBottom: 4 }}>📊</Text>
          <Text style={{ fontSize: 12 }}>数据</Text>
        </Block>
        <Block align={'center'} flex={1} justify={'center'} padding={12} variant={'outlined'}>
          <Text style={{ fontSize: 20, marginBottom: 4 }}>⚙️</Text>
          <Text style={{ fontSize: 12 }}>设置</Text>
        </Block>
        <Block align={'center'} flex={1} justify={'center'} padding={12} variant={'outlined'}>
          <Text style={{ fontSize: 20, marginBottom: 4 }}>📱</Text>
          <Text style={{ fontSize: 12 }}>应用</Text>
        </Block>
      </Flexbox>
      <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>嵌套布局</Text>
      <Block padding={16} variant="outlined">
        <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>外层容器</Text>
        <Block horizontal justify="space-around" style={{ padding: 12 }} variant="filled">
          <Block padding={8} variant="borderless">
            <Text>子块 1</Text>
          </Block>
          <Block padding={8} variant="borderless">
            <Text>子块 2</Text>
          </Block>
          <Block padding={8} variant="borderless">
            <Text>子块 3</Text>
          </Block>
        </Block>
      </Block>
    </Flexbox>
  );
};
