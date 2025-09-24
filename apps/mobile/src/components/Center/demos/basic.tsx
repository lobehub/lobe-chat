import React from 'react';
import { Text, View } from 'react-native';

import Center from '../index';

const BasicDemo = () => {
  const boxStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 8,
    padding: 16,
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Center 基础用法</Text>

      <Text style={{ marginBottom: 8 }}>完全居中</Text>
      <Center
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          height: 120,
          marginBottom: 16,
        }}
      >
        <View style={[boxStyle, { backgroundColor: '#e3f2fd' }]}>
          <Text>居中内容</Text>
        </View>
      </Center>

      <Text style={{ marginBottom: 8 }}>只水平居中</Text>
      <Center
        horizontal={true}
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          height: 120,
          marginBottom: 16,
        }}
        vertical={false}
      >
        <View style={[boxStyle, { backgroundColor: '#fff3e0' }]}>
          <Text>水平居中</Text>
        </View>
      </Center>

      <Text style={{ marginBottom: 8 }}>只垂直居中</Text>
      <Center
        horizontal={false}
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          height: 120,
          marginBottom: 16,
        }}
        vertical={true}
      >
        <View style={[boxStyle, { backgroundColor: '#e8f5e8' }]}>
          <Text>垂直居中</Text>
        </View>
      </Center>
    </View>
  );
};

export default BasicDemo;
