import { Block, Flexbox } from '@lobehub/ui-rn';
import React, { useState } from 'react';
import { Alert, Text } from 'react-native';

const ClickableDemo = () => {
  const [clickCount, setClickCount] = useState(0);

  const handlePress = (variant: string) => {
    setClickCount((prev) => prev + 1);
    Alert.alert('Block 点击', `你点击了 ${variant} Block！总点击次数: ${clickCount + 1}`);
  };

  return (
    <Flexbox gap={16}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>可点击的 Block</Text>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Clickable Filled Block</Text>
      <Block
        clickable
        onPress={() => handlePress('Filled')}
        style={{ marginBottom: 16, padding: 16 }}
        variant="filled"
      >
        <Text>点击我！(Filled)</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Clickable Outlined Block</Text>
      <Block
        clickable
        onPress={() => handlePress('Outlined')}
        style={{ marginBottom: 16, padding: 16 }}
        variant="outlined"
      >
        <Text>点击我！(Outlined)</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Clickable Borderless Block</Text>
      <Block clickable onPress={() => handlePress('Borderless')} padding={16} variant="borderless">
        <Text>点击我！(Borderless)</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>组合效果</Text>
      <Block clickable onPress={() => handlePress('组合')} padding={16} shadow variant="filled">
        <Text>点击我！(组合效果：clickable + shadow + glass)</Text>
      </Block>

      <Text style={{ color: '#666', fontSize: 12 }}>总点击次数: {clickCount}</Text>
    </Flexbox>
  );
};

export default ClickableDemo;
