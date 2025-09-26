import type { TextStyle, ViewStyle } from 'react-native';

import type { AliasToken } from '../interface';

export interface LobeStylish {
  active: ViewStyle;
  blur: ViewStyle;
  blurStrong: ViewStyle;
  disabled: ViewStyle;
  resetLinkColor: TextStyle;
  shadow: ViewStyle;
  variantBorderless: ViewStyle;
  variantBorderlessActive: ViewStyle;
  variantBorderlessDanger: ViewStyle;
  variantBorderlessHover: ViewStyle;
  variantFilled: ViewStyle;
  variantFilledActive: ViewStyle;
  variantFilledDanger: ViewStyle;
  variantFilledHover: ViewStyle;
  variantOutlined: ViewStyle;
  variantOutlinedActive: ViewStyle;
  variantOutlinedDanger: ViewStyle;
  variantOutlinedHover: ViewStyle;
}

export const generateStylish = (token: AliasToken, isDarkMode: boolean): LobeStylish => {
  return {
    active: {
      backgroundColor: token.colorFillSecondary,
    },

    blur: {
      backgroundColor: `${token.colorBgContainer}CC`, // 80% 透明度
    },

    blurStrong: {
      backgroundColor: `${token.colorBgContainer}E6`, // 90% 透明度
    },

    disabled: {
      opacity: 0.5,
    },

    resetLinkColor: {
      color: token.colorTextSecondary,
      textDecorationLine: 'none',
    },

    shadow: {
      elevation: 2,
    },

    variantBorderless: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },

    variantBorderlessActive: {
      backgroundColor: isDarkMode ? token.colorFillQuaternary : token.colorFillSecondary,
      borderWidth: 0,
    },

    variantBorderlessDanger: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },

    variantBorderlessHover: {
      backgroundColor: token.colorFillTertiary,
      borderWidth: 0,
    },

    variantFilled: {
      backgroundColor: token.colorFillTertiary,
      borderWidth: 0,
    },

    variantFilledActive: {
      backgroundColor: isDarkMode ? token.colorFillTertiary : token.colorFill,
    },

    variantFilledDanger: {
      backgroundColor: token.colorErrorFillTertiary,
      borderWidth: 0,
    },

    variantFilledHover: {
      backgroundColor: token.colorFillSecondary,
    },

    variantOutlined: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorderSecondary,
      borderWidth: 1,
    },

    variantOutlinedActive: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      borderWidth: 1,
    },

    variantOutlinedDanger: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorErrorBorder,
      borderWidth: 1,
    },

    variantOutlinedHover: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      borderWidth: 1,
    },
  };
};
