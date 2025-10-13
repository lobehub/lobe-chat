import { Space, Text, useTheme } from '@lobehub/ui-rn';
import type { ReactNode } from 'react';
import { View } from 'react-native';

const DemoItem = ({ children }: { children: ReactNode }) => {
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
