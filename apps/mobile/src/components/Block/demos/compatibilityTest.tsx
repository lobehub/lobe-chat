import React from 'react';
import { Text, View } from 'react-native';

import { createStyles } from '@/theme';

// 测试不使用 stylish 的旧组件（只接收 token）
const useOldStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },
  text: {
    color: token.colorText,
    fontSize: 16,
  },
}));

// 测试使用 stylish 的新组件
const useNewStyles = createStyles(({ token, stylish }) => ({
  container: {
    ...stylish?.variantFilled,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },
  shadowContainer: {
    ...stylish?.variantOutlined,
    ...stylish?.shadow,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },
  text: {
    color: token.colorText,
    fontSize: 16,
  },
}));

// 测试混合使用的组件（可选 stylish）
const useMixedStyles = createStyles(({ token, stylish }) => ({
  text: {
    color: token.colorText,
    fontSize: 14,
  },

  // 纯 token 样式
  tokenOnly: {
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 8,
  },

  // 使用 stylish（当存在时）
  withStylish: stylish
    ? {
        ...stylish.variantBorderless,
        borderRadius: token.borderRadius,
        marginBottom: 12,
        padding: 16,
      }
    : {
        backgroundColor: token.colorFillTertiary,
        borderRadius: token.borderRadius,
        marginBottom: 12,
        padding: 16,
      },
}));

const CompatibilityTestDemo = () => {
  const oldStyles = useOldStyles();
  const newStyles = useNewStyles();
  const mixedStyles = useMixedStyles();

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>兼容性测试</Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>1. 旧组件（只使用 token）</Text>
      <View style={oldStyles.styles.container}>
        <Text style={oldStyles.styles.text}>只接收 token 参数的组件，应该正常工作</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>2. 新组件（使用 token + stylish）</Text>
      <View style={newStyles.styles.container}>
        <Text style={newStyles.styles.text}>使用 stylish.variantFilled 的容器</Text>
      </View>

      <View style={newStyles.styles.shadowContainer}>
        <Text style={newStyles.styles.text}>使用 stylish.variantOutlined + shadow 的容器</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>3. 混合组件（条件使用 stylish）</Text>
      <View style={mixedStyles.styles.withStylish}>
        <Text style={mixedStyles.styles.text}>条件使用 stylish 的容器</Text>
      </View>

      <View style={mixedStyles.styles.tokenOnly}>
        <Text style={[mixedStyles.styles.text, { color: 'white' }]}>只使用 token 的容器</Text>
      </View>

      <View
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          marginTop: 16,
          padding: 12,
        }}
      >
        <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
          ✅ 测试结果：{'\n'}- 旧组件（只用 token）: {oldStyles.styles ? '正常' : '失败'}
          {'\n'}- 新组件（token + stylish）: {newStyles.styles ? '正常' : '失败'}
          {'\n'}- 混合组件: {mixedStyles.styles ? '正常' : '失败'}
          {'\n'}- Stylish 可用: {newStyles.stylish ? '是' : '否'}
        </Text>
      </View>
    </View>
  );
};

export default CompatibilityTestDemo;
