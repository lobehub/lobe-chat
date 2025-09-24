import React from 'react';
import { Text, View } from 'react-native';

import Center from '../index';

const AdvancedDemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Center 高级用法</Text>

      <Text style={{ marginBottom: 8 }}>设置最小尺寸</Text>
      <Center
        minHeight={150}
        minWidth={200}
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          marginBottom: 16,
        }}
      >
        <View style={{ backgroundColor: '#e3f2fd', borderRadius: 6, padding: 16 }}>
          <Text>最小尺寸容器</Text>
        </View>
      </Center>

      <Text style={{ marginBottom: 8 }}>填充模式 (block=true)</Text>
      <Center
        block={true}
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          height: 120,
          marginBottom: 16,
        }}
      >
        <View style={{ backgroundColor: '#fff3e0', borderRadius: 6, padding: 16 }}>
          <Text>填充宽度</Text>
        </View>
      </Center>

      <Text style={{ marginBottom: 8 }}>多个子元素</Text>
      <Center
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          height: 150,
          marginBottom: 16,
        }}
      >
        <View style={{ backgroundColor: '#ffebee', borderRadius: 6, marginBottom: 8, padding: 12 }}>
          <Text>子元素 1</Text>
        </View>
        <View style={{ backgroundColor: '#e8f5e8', borderRadius: 6, marginBottom: 8, padding: 12 }}>
          <Text>子元素 2</Text>
        </View>
        <View style={{ backgroundColor: '#e3f2fd', borderRadius: 6, padding: 12 }}>
          <Text>子元素 3</Text>
        </View>
      </Center>

      <Text style={{ marginBottom: 8 }}>嵌套使用</Text>
      <Center
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          height: 180,
          marginBottom: 16,
        }}
      >
        <Center
          style={{
            backgroundColor: '#e3f2fd',
            borderRadius: 8,
            height: 120,
            width: 120,
          }}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 4, padding: 12 }}>
            <Text>嵌套居中</Text>
          </View>
        </Center>
      </Center>
    </View>
  );
};

export default AdvancedDemo;
