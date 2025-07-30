import React from 'react';
import { Text, View } from 'react-native';
import { useThemeToken } from '@/mobile/theme';
import Space from '../index';

const DemoItem = ({
  children,
  size = 'normal',
}: {
  children: React.ReactNode;
  size?: 'small' | 'normal' | 'large';
}) => {
  const token = useThemeToken();

  const getHeight = () => {
    switch (size) {
      case 'small': {
        return 20;
      }
      case 'large': {
        return 70;
      }
      default: {
        return 40;
      }
    }
  };

  return (
    <View
      style={{
        backgroundColor: token.colorFillTertiary,
        borderRadius: 4,
        height: getHeight(),
        justifyContent: 'center',
        padding: 8,
      }}
    >
      <Text style={{ color: token.colorText }}>{children}</Text>
    </View>
  );
};

export const AlignmentDemo = () => {
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
          Start（默认）：
        </Text>
        <Space align="start">
          <DemoItem size="small">Small</DemoItem>
          <DemoItem>Normal</DemoItem>
          <DemoItem size="large">Large</DemoItem>
        </Space>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          Center：
        </Text>
        <Space align="center">
          <DemoItem size="small">Small</DemoItem>
          <DemoItem>Normal</DemoItem>
          <DemoItem size="large">Large</DemoItem>
        </Space>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          End：
        </Text>
        <Space align="end">
          <DemoItem size="small">Small</DemoItem>
          <DemoItem>Normal</DemoItem>
          <DemoItem size="large">Large</DemoItem>
        </Space>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          Baseline：
        </Text>
        <Space align="baseline">
          <DemoItem size="small">Small</DemoItem>
          <DemoItem>Normal</DemoItem>
          <DemoItem size="large">Large</DemoItem>
        </Space>
      </View>
    </View>
  );
};

export default AlignmentDemo;
