import React from 'react';
import { Text, View } from 'react-native';

import { cva, mergeStyles, useThemeToken } from '@/theme';

// 演示如何在组件的 style 文件中定义 CVA 变体
// 模拟一个样式文件的结构
const useExampleStyles = () => {
  const token = useThemeToken();

  // 基础样式
  const styles = {
    container: {
      borderRadius: token.borderRadius,
      padding: 16,
    },
    large: {
      fontSize: 18,
      padding: 24,
    },
    primary: {
      backgroundColor: token.colorPrimary,
    },
    rounded: {
      borderRadius: token.borderRadiusLG,
    },
    secondary: {
      backgroundColor: token.colorBgContainerSecondary,
    },
    small: {
      fontSize: 12,
      padding: 8,
    },
    success: {
      backgroundColor: token.colorSuccess,
    },
    withShadow: {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { height: 2, width: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  };

  // CVA 变体定义 - 在 style 文件中定义
  const cardVariants = cva(styles.container, {
    compoundVariants: [
      {
        shadow: true,
        style: {
          ...styles.withShadow,
          shadowColor: token.colorPrimary,
        },
        variant: 'primary',
      },
      {
        rounded: true,
        size: 'large',
        style: {
          borderRadius: token.borderRadiusLG * 1.5,
        },
      },
    ],
    defaultVariants: {
      rounded: false,
      shadow: false,
      size: 'medium',
      variant: 'secondary',
    },
    variants: {
      rounded: {
        false: null,
        true: styles.rounded,
      },
      shadow: {
        false: null,
        true: styles.withShadow,
      },
      size: {
        // 使用默认的 container 样式
        large: styles.large,

        medium: null,
        small: styles.small,
      },
      variant: {
        primary: styles.primary,
        secondary: styles.secondary,
        success: styles.success,
      },
    },
  });

  return { cardVariants, styles };
};

const StylePatternDemo = () => {
  const { cardVariants } = useExampleStyles();

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>CVA 在 Style 文件中的使用模式</Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>基础变体</Text>

      <View style={mergeStyles(cardVariants({ variant: 'primary' }), { marginBottom: 12 })}>
        <Text style={{ color: 'white' }}>Primary Card</Text>
      </View>

      <View style={mergeStyles(cardVariants({ variant: 'secondary' }), { marginBottom: 12 })}>
        <Text>Secondary Card (默认)</Text>
      </View>

      <View style={mergeStyles(cardVariants({ variant: 'success' }), { marginBottom: 16 })}>
        <Text style={{ color: 'white' }}>Success Card</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>尺寸变体</Text>

      <View
        style={mergeStyles(cardVariants({ size: 'small', variant: 'primary' }), {
          marginBottom: 8,
        })}
      >
        <Text style={{ color: 'white' }}>Small Primary Card</Text>
      </View>

      <View
        style={mergeStyles(cardVariants({ size: 'large', variant: 'success' }), {
          marginBottom: 16,
        })}
      >
        <Text style={{ color: 'white' }}>Large Success Card</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>组合效果</Text>

      <View
        style={mergeStyles(
          cardVariants({
            rounded: true,
            shadow: true,
            size: 'large',
            variant: 'primary',
          }),
          { marginBottom: 8 },
        )}
      >
        <Text style={{ color: 'white' }}>
          Primary + Shadow + Rounded + Large
          {'\n'}(带复合变体效果)
        </Text>
      </View>

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
        💡 模式说明：{'\n'}
        1. 在 style 文件中定义基础样式对象{'\n'}
        2. 使用 cva() 创建变体函数{'\n'}
        3. 在组件中导入并使用变体函数{'\n'}
        4. 这样可以保持样式逻辑的集中管理
      </Text>
    </View>
  );
};

export default StylePatternDemo;
