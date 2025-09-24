import React from 'react';
import { Text, View } from 'react-native';

import { cva, mergeStyles } from '@/theme';

import Block from '../index';

// 创建一个自定义的 CVA 变体示例
const customBlockVariants = cva(
  {
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  {
    compoundVariants: [
      {
        bordered: true,
        style: {
          borderColor: '#6c757d',
        },
        theme: 'dark',
      },
      {
        size: 'spacious',
        style: {
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { height: 2, width: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        theme: 'colorful',
      },
    ],
    defaultVariants: {
      bordered: false,
      size: 'normal',
      theme: 'light',
    },
    variants: {
      bordered: {
        false: {
          borderWidth: 0,
        },
        true: {
          borderWidth: 1,
        },
      },
      size: {
        compact: {
          padding: 8,
        },
        normal: {
          padding: 16,
        },
        spacious: {
          padding: 24,
        },
      },
      theme: {
        colorful: {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
        },
        dark: {
          backgroundColor: '#343a40',
          borderColor: '#495057',
        },
        light: {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
        },
      },
    },
  },
);

const CVADemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>RN CVA 自定义示例</Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>使用自定义 CVA 变体</Text>

      <View
        style={mergeStyles(
          customBlockVariants({ bordered: true, size: 'compact', theme: 'light' }),
        )}
      >
        <Text>Light Compact Bordered</Text>
      </View>

      <View style={mergeStyles(customBlockVariants({ size: 'normal', theme: 'dark' }))}>
        <Text style={{ color: 'white' }}>Dark Normal</Text>
      </View>

      <View
        style={mergeStyles(
          customBlockVariants({ bordered: true, size: 'spacious', theme: 'colorful' }),
        )}
      >
        <Text>Colorful Spacious Bordered (带阴影)</Text>
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>Block 组件 + CVA</Text>

      <Block shadow variant="filled">
        <Text>标准 Block 组件</Text>
      </Block>

      <Block clickable onPress={() => console.log('CVA Block clicked!')} variant="outlined">
        <Text>可点击的 Block</Text>
      </Block>

      <Block glass variant="borderless">
        <Text>玻璃效果 Block</Text>
      </Block>

      <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>组合使用</Text>

      <Block
        shadow
        style={mergeStyles(
          customBlockVariants({ size: 'compact', theme: 'colorful' }),
          { marginBottom: 0 }, // 覆盖 marginBottom
        )}
        variant="filled"
      >
        <Text>Block + 自定义 CVA 样式</Text>
      </Block>

      <Text
        style={{
          color: '#666',
          fontSize: 12,
          fontStyle: 'italic',
          marginTop: 16,
        }}
      >
        💡 这个示例展示了如何创建和使用自定义的 RN CVA 变体， 以及如何与现有组件结合使用。
      </Text>
    </View>
  );
};

export default CVADemo;
