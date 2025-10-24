import { mix } from 'polished';

import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, isDarkMode }) => ({
  container: {
    alignSelf: 'flex-start',
    backgroundColor: isDarkMode
      ? mix(0.5, token.colorFillTertiary, token.colorFillQuaternary)
      : token.colorFillQuaternary,
    borderRadius: token.borderRadiusLG * 1.5,
    padding: 2,
    position: 'relative' as const,
  },
  containerBlock: {
    alignSelf: 'stretch',
    width: '100%',
  },
  containerRound: {
    borderRadius: 100,
  },
  indicator: {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadius * 1.5,
    elevation: 1,
    position: 'absolute' as const,
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  indicatorRound: {
    borderRadius: 100,
  },
  // Segment 基础样式
  segmentBase: {
    alignItems: 'center' as const,
    borderRadius: token.borderRadius,
    justifyContent: 'center' as const,
    zIndex: 1,
  },
  // Block 模式下均分宽度
  segmentBlock: {
    flex: 1,
  },
  // Segment 状态变体
  segmentDisabled: {
    opacity: 0.4,
  },

  segmentLarge: {
    minHeight: 48,
    paddingBlock: 8,
    paddingInline: 24,
  },

  segmentMiddle: {
    minHeight: 36,
    paddingBlock: 6,
    paddingInline: 20,
  },

  segmentPressed: {
    opacity: 0.8,
  },

  // Segment 形状变体
  segmentRound: {
    borderRadius: 100,
  },

  // Segment 尺寸变体
  segmentSmall: {
    minHeight: 28,
    paddingBlock: 4,
    paddingInline: 16,
  },

  // Text 基础样式
  textBase: {
    color: token.colorTextSecondary,
    fontFamily: token.fontFamily,
  },

  textDisabled: {
    color: token.colorTextDisabled,
  },

  textLarge: {
    fontSize: token.fontSizeLG,
  },

  textMiddle: {
    fontSize: token.fontSize,
  },

  // Text 状态变体
  textSelected: {
    color: token.colorText,
  },

  // Text 尺寸变体
  textSmall: {
    fontSize: token.fontSizeSM,
  },
}));
