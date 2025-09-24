import React from 'react';
import { Text, View } from 'react-native';

import FlexBox from '../index';

const BasicDemo = () => {
  const boxStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 8,
    padding: 16,
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>FlexBox 基础用法</Text>

      <Text style={{ marginBottom: 8 }}>{'水平排列 (direction="row")'}</Text>
      <FlexBox direction="row" style={{ marginBottom: 16, minHeight: 60 }}>
        <View style={[boxStyle, { backgroundColor: '#ffebee' }]}>
          <Text>Item 1</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#e8f5e8' }]}>
          <Text>Item 2</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#e3f2fd' }]}>
          <Text>Item 3</Text>
        </View>
      </FlexBox>

      <Text style={{ marginBottom: 8 }}>{'垂直排列 (direction="column")'}</Text>
      <FlexBox direction="column" style={{ marginBottom: 16 }}>
        <View style={[boxStyle, { backgroundColor: '#fff3e0' }]}>
          <Text>Item A</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#f3e5f5' }]}>
          <Text>Item B</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#e0f2f1' }]}>
          <Text>Item C</Text>
        </View>
      </FlexBox>
    </View>
  );
};

export default BasicDemo;
