import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

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
  variantBorderlessDangerHover: ViewStyle;
  variantBorderlessHover: ViewStyle;
  variantFilled: ViewStyle;
  variantFilledActive: ViewStyle;
  variantFilledDanger: ViewStyle;
  variantFilledDangerHover: ViewStyle;
  variantFilledHover: ViewStyle;
  variantOutlined: ViewStyle;
  variantOutlinedActive: ViewStyle;
  variantOutlinedDanger: ViewStyle;
  variantOutlinedDangerHover: ViewStyle;
  variantOutlinedHover: ViewStyle;
}

export const generateStylish = (token: AliasToken): LobeStylish => {
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
      shadowColor: '#000',
      shadowOffset: {
        height: 1,
        width: 0,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },

    variantBorderless: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },

    variantBorderlessActive: {
      backgroundColor: token.colorFillTertiary,
      borderWidth: 0,
    },

    variantBorderlessDanger: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },

    variantBorderlessDangerHover: {
      backgroundColor: token.colorErrorFillSecondary,
      borderWidth: 0,
    },

    variantBorderlessHover: {
      backgroundColor: token.colorFillSecondary,
      borderWidth: 0,
    },

    variantFilled: {
      backgroundColor: token.colorFillTertiary,
      borderWidth: 0,
    },

    variantFilledActive: {
      backgroundColor: token.colorFillSecondary,
      borderWidth: 0,
    },

    variantFilledDanger: {
      backgroundColor: token.colorErrorFillTertiary,
      borderWidth: 0,
    },

    variantFilledDangerHover: {
      backgroundColor: token.colorErrorFill,
      borderWidth: 0,
    },

    variantFilledHover: {
      backgroundColor: token.colorFill,
      borderWidth: 0,
    },

    variantOutlined: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorFillSecondary,
      borderWidth: StyleSheet.hairlineWidth,
    },

    variantOutlinedActive: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorFillSecondary,
      borderWidth: StyleSheet.hairlineWidth,
    },

    variantOutlinedDanger: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorFillSecondary,
      borderWidth: StyleSheet.hairlineWidth,
    },

    variantOutlinedDangerHover: {
      backgroundColor: token.colorErrorBg,
      borderColor: token.colorErrorFill,
      borderWidth: StyleSheet.hairlineWidth,
    },

    variantOutlinedHover: {
      backgroundColor: token.colorBgContainerSecondary,
      borderColor: token.colorFillSecondary,
      borderWidth: StyleSheet.hairlineWidth,
    },
  };
};
