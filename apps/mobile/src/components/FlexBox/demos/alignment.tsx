import React from 'react';
import { Text, View } from 'react-native';

import FlexBox from '../index';

const AlignmentDemo = () => {
  const boxStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    margin: 4,
    padding: 12,
  };

  const containerStyle = {
    backgroundColor: '#fafafa',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 80,
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>FlexBox 对齐方式</Text>

      <Text style={{ marginBottom: 8 }}>{'主轴居中 (justify="center")'}</Text>
      <FlexBox direction="row" justify="center" style={containerStyle}>
        <View style={[boxStyle, { backgroundColor: '#ffcdd2' }]}>
          <Text>1</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#c8e6c9' }]}>
          <Text>2</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#bbdefb' }]}>
          <Text>3</Text>
        </View>
      </FlexBox>

      <Text style={{ marginBottom: 8 }}>{'两端对齐 (justify="space-between")'}</Text>
      <FlexBox direction="row" justify="space-between" style={containerStyle}>
        <View style={[boxStyle, { backgroundColor: '#ffcdd2' }]}>
          <Text>1</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#c8e6c9' }]}>
          <Text>2</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#bbdefb' }]}>
          <Text>3</Text>
        </View>
      </FlexBox>

      <Text style={{ marginBottom: 8 }}>{'交叉轴居中 (align="center")'}</Text>
      <FlexBox align="center" direction="row" style={containerStyle}>
        <View style={[boxStyle, { backgroundColor: '#ffe0b2', height: 30 }]}>
          <Text>Small</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#f8bbd9', height: 50 }]}>
          <Text>Medium</Text>
        </View>
        <View style={[boxStyle, { backgroundColor: '#d1c4e9', height: 40 }]}>
          <Text>Large</Text>
        </View>
      </FlexBox>
    </View>
  );
};

export default AlignmentDemo;
