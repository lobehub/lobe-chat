import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { conditionalStyle, cva, mergeStyles } from './cva';

// 示例1: 基础按钮变体
const buttonVariants = cva(
  {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  {
    compoundVariants: [
      {
        size: 'large',
        style: {
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { height: 2, width: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        variant: 'primary',
      },
    ],
    defaultVariants: {
      disabled: false,
      size: 'medium',
      variant: 'primary',
    },
    variants: {
      disabled: {
        false: null,
        true: {
          opacity: 0.5,
        },
      },
      size: {
        large: {
          paddingHorizontal: 24,
          paddingVertical: 12,
        },
        small: {
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
      },
      variant: {
        outline: {
          backgroundColor: 'transparent',
          borderColor: '#007bff',
          borderWidth: 1,
        },
        primary: {
          backgroundColor: '#007bff',
        },
        secondary: {
          backgroundColor: '#6c757d',
        },
      },
    },
  },
);

// 示例2: 文本变体
const textVariants = cva(
  {
    fontFamily: 'System',
  },
  {
    defaultVariants: {
      color: 'primary',
      size: 'medium',
      weight: 'normal',
    },
    variants: {
      color: {
        danger: { color: '#dc3545' },
        primary: { color: '#007bff' },
        secondary: { color: '#6c757d' },
        success: { color: '#28a745' },
        warning: { color: '#ffc107' },
      },
      size: {
        large: { fontSize: 20 },
        medium: { fontSize: 16 },
        small: { fontSize: 12 },
        xl: { fontSize: 24 },
      },
      weight: {
        bold: { fontWeight: 'bold' },
        normal: { fontWeight: 'normal' },
        semibold: { fontWeight: '600' },
      },
    },
  },
);

// 示例组件
export const CVAExampleComponent = () => {
  return (
    <View style={{ padding: 20 }}>
      {/* 基础按钮示例 */}
      <TouchableOpacity style={mergeStyles(buttonVariants({ size: 'large', variant: 'primary' }))}>
        <Text style={mergeStyles(textVariants({ color: 'white', weight: 'bold' }))}>
          Primary Large Button
        </Text>
      </TouchableOpacity>

      <View style={{ height: 10 }} />

      <TouchableOpacity style={mergeStyles(buttonVariants({ size: 'small', variant: 'outline' }))}>
        <Text style={mergeStyles(textVariants({ color: 'primary', size: 'small' }))}>
          Outline Small Button
        </Text>
      </TouchableOpacity>

      <View style={{ height: 10 }} />

      {/* 禁用状态 */}
      <TouchableOpacity
        disabled
        style={mergeStyles(buttonVariants({ disabled: true, variant: 'secondary' }))}
      >
        <Text style={mergeStyles(textVariants({ color: 'secondary' }))}>Disabled Button</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />

      {/* 文本示例 */}
      <Text style={mergeStyles(textVariants({ color: 'primary', size: 'xl', weight: 'bold' }))}>
        Extra Large Bold Primary Text
      </Text>

      <Text style={mergeStyles(textVariants({ color: 'secondary', size: 'small' }))}>
        Small secondary text
      </Text>

      {/* 条件样式示例 */}
      <View
        style={mergeStyles(
          { marginTop: 10, padding: 16 },
          conditionalStyle(
            true, // 这里可以是任何条件
            { backgroundColor: '#e8f5e9' }, // 条件为真的样式
            { backgroundColor: '#ffebee' }, // 条件为假的样式
          ),
        )}
      >
        <Text>Conditional styling example</Text>
      </View>
    </View>
  );
};

// 示例3: 复杂的卡片变体
export const cardVariants = cva(
  {
    borderRadius: 8,
    padding: 16,
  },
  {
    compoundVariants: [
      {
        elevation: 'high',
        style: {
          borderWidth: 2,
        },
        variant: 'primary',
      },
    ],
    defaultVariants: {
      elevation: 'low',
      variant: 'default',
    },
    variants: {
      elevation: {
        high: {
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { height: 4, width: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        },
        low: {
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { height: 1, width: 0 },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
        },
        medium: {
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { height: 2, width: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        none: {},
      },
      variant: {
        danger: {
          backgroundColor: '#ffebee',
          borderColor: '#f44336',
          borderWidth: 1,
        },
        default: {
          backgroundColor: '#ffffff',
        },
        primary: {
          backgroundColor: '#e3f2fd',
          borderColor: '#2196f3',
          borderWidth: 1,
        },
        success: {
          backgroundColor: '#e8f5e9',
          borderColor: '#4caf50',
          borderWidth: 1,
        },
        warning: {
          backgroundColor: '#fff3e0',
          borderColor: '#ff9800',
          borderWidth: 1,
        },
      },
    },
  },
);

export default CVAExampleComponent;
