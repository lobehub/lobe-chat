import { Space } from '@lobehub/ui-rn';
import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/components/theme';

const DemoItem = ({ children }: { children: React.ReactNode }) => {
  const token = useTheme();

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
