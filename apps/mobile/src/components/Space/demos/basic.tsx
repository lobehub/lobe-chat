import React from 'react';
import { Text, View } from 'react-native';
import { useThemeToken } from '@/theme';
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

export const BasicDemo = () => (
  <View style={{ padding: 16 }}>
    <Space>
      <DemoItem>Item 1</DemoItem>
      <DemoItem>Item 2</DemoItem>
      <DemoItem>Item 3</DemoItem>
    </Space>
  </View>
);

export default BasicDemo;
