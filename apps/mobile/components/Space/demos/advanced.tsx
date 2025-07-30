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

export const AdvancedDemo = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      {/* 自动换行演示 */}
      <Text
        style={{
          color: token.colorText,
          fontWeight: 'bold',
          marginBottom: 16,
        }}
      >
        自动换行：
      </Text>
      <View style={{ marginBottom: 24, width: '100%' }}>
        <Space wrap>
          {Array.from({ length: 10 }, (_, index) => (
            <DemoItem key={index}>Item {index + 1}</DemoItem>
          ))}
        </Space>
      </View>

      {/* 分隔符演示 */}
      <Text
        style={{
          color: token.colorText,
          fontWeight: 'bold',
          marginBottom: 16,
        }}
      >
        分隔符：
      </Text>
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          水平分隔符：
        </Text>
        <Space split={<Text style={{ color: token.colorTextSecondary }}>|</Text>}>
          <Text style={{ color: token.colorText }}>Item 1</Text>
          <Text style={{ color: token.colorText }}>Item 2</Text>
          <Text style={{ color: token.colorText }}>Item 3</Text>
        </Space>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: token.colorText,
            marginBottom: 8,
          }}
        >
          垂直分隔符：
        </Text>
        <Space
          direction="vertical"
          split={<View style={{ backgroundColor: token.colorBorderSecondary, height: 1 }} />}
        >
          <Text style={{ color: token.colorText }}>Item 1</Text>
          <Text style={{ color: token.colorText }}>Item 2</Text>
          <Text style={{ color: token.colorText }}>Item 3</Text>
        </Space>
      </View>
    </View>
  );
};

export default AdvancedDemo;
