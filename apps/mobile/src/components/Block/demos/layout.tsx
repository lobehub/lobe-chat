import React from 'react';
import { Text, View } from 'react-native';

import Block from '../index';

const LayoutDemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Block 布局示例</Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>水平布局</Text>
      <Block
        align="center"
        direction="row"
        justify="space-between"
        style={{ marginBottom: 16, padding: 16 }}
        variant="outlined"
      >
        <Text>左侧</Text>
        <Text>中间</Text>
        <Text>右侧</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>垂直布局 - 居中对齐</Text>
      <Block
        align="center"
        direction="column"
        justify="center"
        shadow
        style={{ marginBottom: 16, minHeight: 120, padding: 24 }}
        variant="filled"
      >
        <Text style={{ marginBottom: 8 }}>标题</Text>
        <Text style={{ color: '#666', fontSize: 12 }}>副标题</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>卡片式布局</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Block
          shadow
          style={{
            alignItems: 'center',
            flex: 1,
            marginRight: 8,
            padding: 16,
          }}
          variant="filled"
        >
          <Text style={{ fontSize: 20, marginBottom: 4 }}>📊</Text>
          <Text style={{ fontSize: 12 }}>数据</Text>
        </Block>

        <Block
          shadow
          style={{
            alignItems: 'center',
            flex: 1,
            marginHorizontal: 4,
            padding: 16,
          }}
          variant="filled"
        >
          <Text style={{ fontSize: 20, marginBottom: 4 }}>⚙️</Text>
          <Text style={{ fontSize: 12 }}>设置</Text>
        </Block>

        <Block
          shadow
          style={{
            alignItems: 'center',
            flex: 1,
            marginLeft: 8,
            padding: 16,
          }}
          variant="filled"
        >
          <Text style={{ fontSize: 20, marginBottom: 4 }}>📱</Text>
          <Text style={{ fontSize: 12 }}>应用</Text>
        </Block>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>嵌套布局</Text>
      <Block style={{ padding: 16 }} variant="outlined">
        <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>外层容器</Text>
        <Block direction="row" justify="space-around" style={{ padding: 12 }} variant="filled">
          <Block style={{ padding: 8 }} variant="borderless">
            <Text>子块 1</Text>
          </Block>
          <Block style={{ padding: 8 }} variant="borderless">
            <Text>子块 2</Text>
          </Block>
          <Block style={{ padding: 8 }} variant="borderless">
            <Text>子块 3</Text>
          </Block>
        </Block>
      </Block>
    </View>
  );
};

export default LayoutDemo;
