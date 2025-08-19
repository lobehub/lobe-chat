import React from 'react';
import { Text, View } from 'react-native';

import { ThemeProvider, useThemeToken } from '../index';

// 示例组件，使用主题 token
const ExampleComponent = () => {
  const token = useThemeToken();

  return (
    <View
      style={{
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadius,
        margin: token.margin,
        padding: token.padding,
      }}
    >
      <Text
        style={{
          color: token.colorText,
          fontSize: token.fontSize,
          fontWeight: token.fontWeightStrong,
        }}
      >
        默认主题示例
      </Text>
      <Text
        style={{
          color: token.colorTextSecondary,
          fontSize: token.fontSizeSM,
          marginTop: token.marginXS,
        }}
      >
        使用默认的主题配置，系统会根据当前模式（亮色/暗色）自动生成主题
      </Text>
    </View>
  );
};

// 基础用法示例：使用默认主题
export default function BasicDemo() {
  return (
    <ThemeProvider>
      <ExampleComponent />
    </ThemeProvider>
  );
}
