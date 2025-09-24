import React from 'react';
import { Text, View } from 'react-native';

import { createStyles } from '@/theme';

import Block from '../index';

// 演示如何使用 stylish 预定义样式
const useExampleStyles = createStyles(({ token, stylish }) => ({
  blurCard: {
    ...stylish?.blur,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },

  // 使用 stylish 预定义的样式
  borderlessCard: {
    ...stylish?.variantBorderless,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },

  container: {
    padding: 16,
  },

  dangerCard: {
    ...stylish?.variantFilledDanger,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },

  disabledCard: {
    ...stylish?.variantFilled,
    ...stylish?.disabled,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },

  outlinedCard: {
    ...stylish?.variantOutlined,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },

  primaryCard: {
    ...stylish?.variantFilled,
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },

  shadowCard: {
    ...stylish?.variantFilled,
    ...stylish?.shadow,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    padding: 16,
  },
}));

const StylishDemo = () => {
  const { styles } = useExampleStyles();

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Stylish 预定义样式示例</Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>基础变体样式</Text>

      <View style={styles.primaryCard}>
        <Text style={{ color: 'white' }}>Primary Card (variantFilled + 自定义颜色)</Text>
      </View>

      <View style={styles.outlinedCard}>
        <Text>Outlined Card (variantOutlined)</Text>
      </View>

      <View style={styles.borderlessCard}>
        <Text>Borderless Card (variantBorderless)</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 8 }}>效果组合</Text>

      <View style={styles.shadowCard}>
        <Text>Shadow Card (variantFilled + shadow)</Text>
      </View>

      <View style={styles.blurCard}>
        <Text>Blur Card (blur effect)</Text>
      </View>

      <View style={styles.dangerCard}>
        <Text style={{ color: 'white' }}>Danger Card (variantFilledDanger)</Text>
      </View>

      <View style={styles.disabledCard}>
        <Text>Disabled Card (variantFilled + disabled)</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>
        Block 组件使用 Stylish
      </Text>

      <Block shadow variant="filled">
        <Text>Block 组件内部也使用了 stylish 样式</Text>
      </Block>

      <Block variant="outlined">
        <Text>Outlined Block 使用 stylish.variantOutlined</Text>
      </Block>

      <Block glass variant="borderless">
        <Text>Borderless + Glass Block</Text>
      </Block>

      <Text
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          color: '#666',
          fontSize: 12,
          fontStyle: 'italic',
          marginTop: 16,
          padding: 12,
        }}
      >
        💡 Stylish 特点：{'\n'}
        1. 预定义了常用的样式变体{'\n'}
        2. 支持组合使用 (spread operator){'\n'}
        3. 自动适配主题和深色模式{'\n'}
        4. 与 CVA 配合使用更强大
      </Text>
    </View>
  );
};

export default StylishDemo;
