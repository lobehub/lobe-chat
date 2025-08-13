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
        自定义 Token + 算法示例
      </Text>
      <Text
        style={{
          color: token.colorTextSecondary,
          fontSize: token.fontSizeSM,
          marginTop: token.marginXS,
        }}
      >
        使用绿色主色调 + 暗色主题算法 + 较小圆角
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
          自定义主色调
        </Text>
      </View>
      <View
        style={{
          backgroundColor: token.colorWarningBg,
          borderColor: token.colorWarningBorder,
          borderRadius: token.borderRadius,
          borderWidth: token.lineWidth,
          marginTop: token.marginSM,
          padding: token.paddingSM,
        }}
      >
        <Text
          style={{
            color: token.colorWarningText,
            fontSize: token.fontSizeSM,
            textAlign: 'center',
          }}
        >
          暗色算法效果展示
        </Text>
      </View>
    </View>
  );
};

// 自定义 Token + 算法示例
export default function CustomTokenAndAlgorithmDemo() {
  return (
    <ThemeProvider
      theme={{
        algorithm: darkAlgorithm,
        token: {
          borderRadius: 2,
          colorPrimary: '#00b96b',
        },
      }}
    >
      <ExampleComponent />
    </ThemeProvider>
  );
}
