import { useThemeToken } from './context';

/**
 * React hook-based theme utilities
 * These utilities depend on React hooks and should only be used in React components
 */

// 获取主题 token 的便捷函数
export const useThemeUtils = () => {
  const token = useThemeToken();

  return {
    // 动画工具
    animation: {
      fast: token.motionDurationFast,
      normal: token.motionDurationMid,
      slow: token.motionDurationSlow,
    },

    // 颜色工具
    colors: {
      background: token.colorBgBase,
      border: token.colorBorder,
      card: token.colorBgContainer,
      error: token.colorError,
      info: token.colorInfo,
      primary: token.colorPrimary,
      success: token.colorSuccess,
      text: token.colorText,
      textSecondary: token.colorTextSecondary,
      textTertiary: token.colorTextTertiary,
      warning: token.colorWarning,
    },

    // 透明度工具
    opacity: {
      disabled: token.opacityDisabled,
      image: token.opacityImage,
      loading: token.opacityLoading,
    },

    // 圆角工具
    radius: {
      lg: token.borderRadiusLG,
      md: token.borderRadius,
      sm: token.borderRadiusSM,
      xs: token.borderRadiusXS,
    },

    // 阴影工具
    shadows: {
      lg: token.boxShadow,
      md: token.boxShadowSecondary,
      sm: token.boxShadowTertiary,
    },

    // 间距工具
    spacing: {
      lg: token.marginLG,
      md: token.margin,
      sm: token.marginSM,
      xl: token.marginXL,
      xs: token.marginXS,
      xxl: token.marginXXL,
    },

    // 字体工具
    typography: {
      fontSize: {
        h1: token.fontSizeHeading1,
        h2: token.fontSizeHeading2,
        h3: token.fontSizeHeading3,
        h4: token.fontSizeHeading4,
        h5: token.fontSizeHeading5,
        lg: token.fontSizeLG,
        md: token.fontSize,
        sm: token.fontSizeSM,
        xl: token.fontSizeXL,
        xs: token.fontSizeSM,
      },
      fontWeight: {
        normal: token.fontWeight,
        strong: token.fontWeightStrong,
      },
      lineHeight: {
        lg: token.lineHeightLG,
        md: token.lineHeight,
        sm: token.lineHeightSM,
      },
    },
  };
};
