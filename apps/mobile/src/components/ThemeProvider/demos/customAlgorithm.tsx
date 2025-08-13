import React from 'react';
import { Text, View } from 'react-native';

import { darkAlgorithm, ThemeProvider, useThemeToken } from '../index';

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
          fontWeight: token.fontWeight,
        }}
      >
        自定义算法示例
      </Text>
      <Text
        style={{
          color: token.colorTextSecondary,
          fontSize: token.fontSizeSM,
          marginTop: token.marginXS,
        }}
      >
        强制使用暗色主题算法，不受系统主题影响
      </Text>
      <View
        style={{
          backgroundColor: token.colorPrimaryBg,
          borderColor: token.colorPrimaryBorder,
          borderRadius: token.borderRadius,
          borderWidth: token.lineWidth,
          marginTop: token.marginSM,
          padding: token.paddingSM,
        }}
      >
        <Text
          style={{
            color: token.colorPrimaryText,
            fontSize: token.fontSizeSM,
            textAlign: 'center',
          }}
        >
          主色调背景示例
        </Text>
      </View>
    </View>
  );
};

// 自定义算法示例：强制使用暗色主题
export default function CustomAlgorithmDemo() {
  return (
    <ThemeProvider
      theme={{
        algorithm: darkAlgorithm,
      }}
    >
      <ExampleComponent />
    </ThemeProvider>
  );
}
