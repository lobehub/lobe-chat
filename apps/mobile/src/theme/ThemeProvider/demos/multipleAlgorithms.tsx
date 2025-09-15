import React from 'react';
import { Text, View } from 'react-native';

import { ThemeProvider, useThemeToken } from '../index';
import { darkAlgorithm } from '@/theme';

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
        多算法组合示例
      </Text>
      <Text
        style={{
          color: token.colorTextSecondary,
          fontSize: token.fontSizeSM,
          marginTop: token.marginXS,
        }}
      >
        使用橙色主色调 + 暗色算法 + 紧凑算法组合
      </Text>

      {/* 展示尺寸效果 */}
      <View style={{ marginTop: token.marginSM }}>
        <Text
          style={{
            color: token.colorText,
            fontSize: token.fontSizeSM,
            marginBottom: token.marginXS,
          }}
        >
          紧凑算法效果（较小的内边距和间距）：
        </Text>
        <View
          style={{
            backgroundColor: token.colorPrimary,
            borderRadius: token.borderRadius,
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
            橙色主色调 (紧凑尺寸)
          </Text>
        </View>
      </View>

      {/* 展示错误色效果 */}
      <View
        style={{
          backgroundColor: token.colorErrorBg,
          borderColor: token.colorErrorBorder,
          borderRadius: token.borderRadius,
          borderWidth: token.lineWidth,
          marginTop: token.marginSM,
          padding: token.paddingSM,
        }}
      >
        <Text
          style={{
            color: token.colorErrorText,
            fontSize: token.fontSizeSM,
            textAlign: 'center',
          }}
        >
          暗色 + 紧凑算法的错误色展示
        </Text>
      </View>
    </View>
  );
};

// 多算法组合示例：暗色 + 紧凑
export default function MultipleAlgorithmsDemo() {
  return (
    <ThemeProvider
      theme={{
        algorithm: [darkAlgorithm],
        token: {
          colorPrimary: '#ff6b35',
        },
      }}
    >
      <ExampleComponent />
    </ThemeProvider>
  );
}
