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
        自定义 Token 示例
      </Text>
      <Text
        style={{
          color: token.colorTextSecondary,
          fontSize: token.fontSizeSM,
          marginTop: token.marginXS,
        }}
      >
        使用绿色主色调和较小的圆角
      </Text>
      <View
        style={{
          backgroundColor: token.colorPrimary,
          borderRadius: token.borderRadius,
          marginTop: token.marginSM,
          padding: token.paddingSM,
        }}
      >
        <Text
          style={{
            color: token.colorWhite,
            fontSize: token.fontSizeSM,
            textAlign: 'center',
          }}
        >
          主色调示例
        </Text>
      </View>
    </View>
  );
};

// 自定义 Token 示例
export default function CustomTokenDemo() {
  return (
    <ThemeProvider
      theme={{
        token: {
          // Seed Token，影响范围大
          borderRadius: 2,
          colorPrimary: '#00b96b',
        },
      }}
    >
      <ExampleComponent />
    </ThemeProvider>
  );
}
