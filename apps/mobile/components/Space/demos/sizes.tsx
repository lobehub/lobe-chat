import React from 'react';
import { Text, View } from 'react-native';
import { useThemeToken } from '@/mobile/theme';
import Space from '../index';

const DemoItem = ({ children }: { children: React.ReactNode }) => {
  const token = useThemeToken();

  return (
    <View
      style={{
        backgroundColor: token.colorFillTertiary,
        borderRadius: 4,
        padding: 8,
      }}
    >
      <Text style={{ color: token.colorText }}>{children}</Text>
    </View>
  );
};

export const SizesDemo = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          Small（默认）：
        </Text>
        <Space size="small">
          <DemoItem>Item 1</DemoItem>
          <DemoItem>Item 2</DemoItem>
          <DemoItem>Item 3</DemoItem>
        </Space>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          Middle：
        </Text>
        <Space size="middle">
          <DemoItem>Item 1</DemoItem>
          <DemoItem>Item 2</DemoItem>
          <DemoItem>Item 3</DemoItem>
        </Space>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          Large：
        </Text>
        <Space size="large">
          <DemoItem>Item 1</DemoItem>
          <DemoItem>Item 2</DemoItem>
          <DemoItem>Item 3</DemoItem>
        </Space>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          自定义大小（20）：
        </Text>
        <Space size={20}>
          <DemoItem>Item 1</DemoItem>
          <DemoItem>Item 2</DemoItem>
          <DemoItem>Item 3</DemoItem>
        </Space>
      </View>
    </View>
  );
};

export default SizesDemo;
