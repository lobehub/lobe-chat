import { Block, Flexbox } from '@lobehub/ui-rn';
import React from 'react';
import { Text } from 'react-native';

const BasicDemo = () => {
  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Block 基础用法</Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Filled 变体（默认）</Text>
      <Block style={{ marginBottom: 16, padding: 16 }}>
        <Text>这是一个 Filled Block</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Outlined 变体</Text>
      <Block style={{ marginBottom: 16, padding: 16 }} variant="outlined">
        <Text>这是一个 Outlined Block</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Borderless 变体</Text>
      <Block style={{ marginBottom: 16, padding: 16 }} variant="borderless">
        <Text>这是一个 Borderless Block</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>带阴影的 Block</Text>
      <Block shadow style={{ marginBottom: 16, padding: 16 }} variant="outlined">
        <Text>这是一个带阴影的 Block</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>玻璃效果 Block</Text>
      <Block glass style={{ marginBottom: 16, padding: 16 }}>
        <Text>这是一个玻璃效果的 Block</Text>
      </Block>
    </Flexbox>
  );
};

export default BasicDemo;
