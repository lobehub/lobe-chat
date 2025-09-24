import React from 'react';
import { Text, View } from 'react-native';

import FlexBox from '../index';

const WrapDemo = () => {
  const boxStyle = {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    margin: 4,
    minWidth: 80,
    padding: 12,
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>FlexBox 换行</Text>

      <Text style={{ marginBottom: 8 }}>{'不换行 (wrap="nowrap")'}</Text>
      <FlexBox
        direction="row"
        style={{
          backgroundColor: '#fafafa',
          borderColor: '#e0e0e0',
          borderRadius: 8,
          borderWidth: 1,
          marginBottom: 16,
          padding: 8,
        }}
        wrap="nowrap"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} style={[boxStyle, { backgroundColor: `hsl(${i * 60}, 70%, 85%)` }]}>
            <Text>Item {i + 1}</Text>
          </View>
        ))}
      </FlexBox>

      <Text style={{ marginBottom: 8 }}>{'自动换行 (wrap="wrap")'}</Text>
      <FlexBox
        direction="row"
        style={{
          backgroundColor: '#fafafa',
          borderColor: '#e0e0e0',
          borderRadius: 8,
          borderWidth: 1,
          marginBottom: 16,
          padding: 8,
        }}
        wrap="wrap"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} style={[boxStyle, { backgroundColor: `hsl(${i * 60}, 70%, 85%)` }]}>
            <Text>Item {i + 1}</Text>
          </View>
        ))}
      </FlexBox>

      <Text style={{ marginBottom: 8 }}>Flex 属性示例</Text>
      <FlexBox
        direction="row"
        style={{
          backgroundColor: '#fafafa',
          borderColor: '#e0e0e0',
          borderRadius: 8,
          borderWidth: 1,
          height: 60,
          marginBottom: 16,
        }}
      >
        <View style={[boxStyle, { backgroundColor: '#ffcdd2', flex: 1 }]}>
          <Text>Flex 1</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#c8e6c9', flex: 2 }]}>
          <Text>Flex 2</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#bbdefb', flex: 1 }]}>
          <Text>Flex 1</Text>
        </View>
      </FlexBox>
    </View>
  );
};

export default WrapDemo;
