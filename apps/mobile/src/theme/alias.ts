import type { AliasToken, MapToken } from '@/theme/interface';
import { getAlphaColor } from './colorUtils';

/**
 * 格式化 Token，从 MapToken 生成 AliasToken
 * 这是开发者最终使用的 Token 层
 */
export function formatToken(mapToken: MapToken): AliasToken {
  const screenBreakpoints = {
    screenLG: 992,
    screenMD: 768,
    screenSM: 576,
    screenXL: 1200,
    screenXS: 480,
    screenXXL: 1600,
  };

  // 如果关闭动画，设置快速动画时长
  const motionTokens = mapToken.motion
    ? {
        motionDurationFast: mapToken.motionDurationFast,
        motionDurationMid: mapToken.motionDurationMid,
        motionDurationSlow: mapToken.motionDurationSlow,
      }
    : {
        motionDurationFast: '0s',
        motionDurationMid: '0s',
        motionDurationSlow: '0s',
      };

  const aliasToken: AliasToken = {
    ...mapToken,
    ...motionTokens,

    // ============== 阴影 ============== //
    boxShadow: {
      elevation: 8,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { height: 6, width: 0 },
      shadowOpacity: 1,
      shadowRadius: 16,
    },

    boxShadowSecondary: {
      elevation: 8,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { height: 6, width: 0 },
      shadowOpacity: 1,
      shadowRadius: 16,
    },

    boxShadowTertiary: {
      elevation: 1,
      shadowColor: 'rgba(0, 0, 0, 0.03)',
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 1,
      shadowRadius: 2,
    },

    colorBgContainerDisabled: mapToken.colorFillTertiary,

    colorBgTextActive: mapToken.colorFill,

    colorBgTextHover: mapToken.colorFillSecondary,

    // ============== 分割线 ============== //
    colorBorderBg: mapToken.colorBgContainer,

    // ============== 轮廓颜色 ============== //
    colorErrorOutline: getAlphaColor(mapToken.colorErrorBg, 0.06),

    colorFillAlter: mapToken.colorFillQuaternary,

    // ============== 内容区域背景色 ============== //
    colorFillContent: mapToken.colorFillSecondary,

    colorFillContentHover: mapToken.colorFill,

    colorHighlight: mapToken.colorError,

    // ============== 图标颜色 ============== //
    colorIcon: mapToken.colorTextTertiary,

    colorIconHover: mapToken.colorText,

    colorSplit: getAlphaColor(mapToken.colorBorderSecondary, 0.06),

    colorTextDescription: mapToken.colorTextTertiary,

    colorTextDisabled: mapToken.colorTextQuaternary,

    colorTextHeading: mapToken.colorText,

    colorTextLabel: mapToken.colorTextSecondary,

    colorTextLightSolid: mapToken.colorWhite,

    // ============== 文本颜色 ============== //
    colorTextPlaceholder: mapToken.colorTextQuaternary,

    colorWarningOutline: getAlphaColor(mapToken.colorWarningBg, 0.06),

    controlInteractiveSize: mapToken.controlHeight / 2,

    controlItemBgActive: mapToken.colorPrimaryBg,

    controlItemBgActiveDisabled: mapToken.colorFill,

    controlItemBgActiveHover: mapToken.colorPrimaryBgHover,

    controlItemBgHover: mapToken.colorFillTertiary,

    controlOutline: getAlphaColor(mapToken.colorPrimaryBg, 0.06),

    // ============== 控制器 ============== //
    controlOutlineWidth: mapToken.lineWidth * 2,

    // ============== 控制器内边距 ============== //
    controlPaddingHorizontal: 12,

    controlPaddingHorizontalSM: 8,

    // ============== 字体 ============== //
    fontSizeIcon: mapToken.fontSizeSM,

    fontWeight: '400',

    fontWeightStrong: '600',

    // ============== 线条 ============== //
    lineWidthFocus: mapToken.lineWidth * 3,

    margin: mapToken.size,

    marginLG: mapToken.sizeLG,

    marginMD: mapToken.sizeMD,

    marginSM: mapToken.sizeSM,

    marginXL: mapToken.sizeXL,

    marginXS: mapToken.sizeXS,

    marginXXL: mapToken.sizeXXL,

    // ============== 外边距 ============== //
    marginXXS: mapToken.sizeXXS,

    opacityDisabled: 0.25,

    // ============== 透明度 ============== //
    opacityLoading: 0.65,

    padding: mapToken.size,

    paddingContentHorizontal: mapToken.sizeMS,

    // 内容内边距
    paddingContentHorizontalLG: mapToken.sizeLG,

    paddingContentHorizontalSM: mapToken.size,

    paddingContentVertical: mapToken.sizeSM,

    paddingContentVerticalLG: mapToken.sizeMS,

    paddingContentVerticalSM: mapToken.sizeXS,

    paddingLG: mapToken.sizeLG,

    paddingMD: mapToken.sizeMD,

    paddingSM: mapToken.sizeSM,

    paddingXL: mapToken.sizeXL,

    paddingXS: mapToken.sizeXS,

    // ============== 内边距 ============== //
    paddingXXS: mapToken.sizeXXS,

    // ============== 屏幕断点 ============== //
    ...screenBreakpoints,
    screenLGMax: screenBreakpoints.screenXL - 1,
    screenLGMin: screenBreakpoints.screenLG,
    screenMDMax: screenBreakpoints.screenLG - 1,
    screenMDMin: screenBreakpoints.screenMD,
    screenSMMax: screenBreakpoints.screenMD - 1,
    screenSMMin: screenBreakpoints.screenSM,
    screenXLMax: screenBreakpoints.screenXXL - 1,
    screenXLMin: screenBreakpoints.screenXL,
    screenXSMax: screenBreakpoints.screenSM - 1,
    screenXSMin: screenBreakpoints.screenXS,
    screenXXLMin: screenBreakpoints.screenXXL,
  };

  return aliasToken;
}
