import type { TextStyle, ViewStyle } from 'react-native';

import type { AliasToken } from '../interface';

interface LobeStylish {
  // 激活状态
  active: ViewStyle;
  // 玻璃效果（半透明背景）
  blur: ViewStyle;
  // 强玻璃效果
  blurStrong: ViewStyle;
  // 禁用状态
  disabled: ViewStyle;
  // 重置链接颜色
  resetLinkColor: TextStyle;
  // 阴影效果
  shadow: ViewStyle;
  // 无边框变体
  variantBorderless: ViewStyle;
  // 危险无边框变体
  variantBorderlessDanger: ViewStyle;
  // 无边框变体（无悬停）
  variantBorderlessWithoutHover: ViewStyle;
  // 填充变体
  variantFilled: ViewStyle;
  // 危险填充变体
  variantFilledDanger: ViewStyle;
  // 填充变体（无悬停）
  variantFilledWithoutHover: ViewStyle;
  // 轮廓变体
  variantOutlined: ViewStyle;
  // 危险轮廓变体
  variantOutlinedDanger: ViewStyle;
  // 轮廓变体（无悬停）
  variantOutlinedWithoutHover: ViewStyle;
}

export const generateStylish = (token: AliasToken, isDarkMode: boolean): LobeStylish => {
  return {
    active: {
      backgroundColor: token.colorFillSecondary,
      // RN 中可以通过 pressedStyle 等方式实现悬停效果
    },

    blur: {
      backgroundColor: `${token.colorBgContainer}CC`, // 80% 透明度
      // 注意：RN 不支持 backdrop-filter，可以考虑使用 BlurView 组件
    },

    blurStrong: {
      backgroundColor: `${token.colorBgContainer}E6`, // 90% 透明度
    },

    disabled: {
      opacity: 0.5,
      // RN 中禁用状态通过 disabled 属性控制
    },

    resetLinkColor: {
      color: token.colorTextSecondary,
      textDecorationLine: 'none',
    },

    shadow: {
      elevation: 3,
      shadowColor: isDarkMode ? token.colorBgLayout : token.colorBorderSecondary,
      shadowOffset: { height: 2, width: 0 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4, // Android 阴影
    },

    variantBorderless: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      // 可点击时的背景色变化需要通过组件状态控制
    },

    variantBorderlessDanger: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      // 危险状态的颜色变化
    },

    variantBorderlessWithoutHover: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },

    variantFilled: {
      backgroundColor: token.colorFillTertiary,
      borderWidth: 0,
    },

    variantFilledDanger: {
      backgroundColor: token.colorErrorFillTertiary,
      borderWidth: 0,
    },

    variantFilledWithoutHover: {
      backgroundColor: token.colorFillTertiary,
      borderWidth: 0,
    },

    variantOutlined: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorderSecondary,
      borderWidth: 1,
    },

    variantOutlinedDanger: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorErrorBorder,
      borderWidth: 1,
    },

    variantOutlinedWithoutHover: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorderSecondary,
      borderWidth: 1,
    },
  };
};

// 导出类型和函数
export type { LobeStylish };
export { generateStylish };
