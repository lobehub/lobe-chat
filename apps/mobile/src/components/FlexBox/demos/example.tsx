import React from 'react';
import { Text, View } from 'react-native';

import Center from '../../Center';
import FlexBox from '../index';

const ExampleDemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>FlexBox + Center 组合示例</Text>

      <Text style={{ marginBottom: 8 }}>导航栏布局</Text>
      <FlexBox
        align="center"
        direction="row"
        justify="space-between"
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          marginBottom: 16,
          padding: 12,
        }}
      >
        <Text style={{ color: '#007bff' }}>返回</Text>
        <Text style={{ fontWeight: 'bold' }}>页面标题</Text>
        <Text style={{ color: '#007bff' }}>更多</Text>
      </FlexBox>

      <Text style={{ marginBottom: 8 }}>卡片布局</Text>
      <FlexBox direction="row" justify="space-around" style={{ marginBottom: 16 }} wrap="wrap">
        {Array.from({ length: 4 }, (_, i) => (
          <Center
            key={i}
            style={{
              backgroundColor: `hsl(${i * 90}, 60%, 85%)`,
              borderRadius: 8,
              height: 80,
              margin: 8,
              width: 80,
            }}
          >
            <Text style={{ fontSize: 12 }}>卡片 {i + 1}</Text>
          </Center>
        ))}
      </FlexBox>

      <Text style={{ marginBottom: 8 }}>底部操作栏</Text>
      <FlexBox
        direction="row"
        justify="space-around"
        style={{
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderRadius: 8,
          borderWidth: 1,
          marginBottom: 16,
          padding: 16,
        }}
      >
        <Center>
          <View
            style={{
              backgroundColor: '#007bff',
              borderRadius: 12,
              height: 24,
              marginBottom: 4,
              width: 24,
            }}
          />
          <Text style={{ fontSize: 12 }}>首页</Text>
        </Center>
        <Center>
          <View
            style={{
              backgroundColor: '#6c757d',
              borderRadius: 12,
              height: 24,
              marginBottom: 4,
              width: 24,
            }}
          />
          <Text style={{ fontSize: 12 }}>发现</Text>
        </Center>
        <Center>
          <View
            style={{
              backgroundColor: '#6c757d',
              borderRadius: 12,
              height: 24,
              marginBottom: 4,
              width: 24,
            }}
          />
          <Text style={{ fontSize: 12 }}>我的</Text>
        </Center>
      </FlexBox>
    </View>
  );
};

export default ExampleDemo;
