export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * React Native 字体粗细类型
 * 可选值: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
 */
export type FontWeightType =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

// ======================================================================
// ==                           Seed Token                             ==
// ======================================================================
// 基础种子 Token，用于派生其他 Token
export interface SeedToken {
  // 圆角
  borderRadius: number;

  colorBgBase: string;
  colorError: string;
  colorInfo: string;
  // 品牌色
  colorPrimary: string;

  // 功能色
  colorSuccess: string;
  // 中性色
  colorTextBase: string;

  colorWarning: string;
  controlHeight: number;
  // 字体
  fontFamily: string;

  fontFamilyCode: string;
  fontSize: number;
  lineType: string;

  // 线宽
  lineWidth: number;

  motion: boolean;
  motionBase: number;

  motionEaseInBack: string;
  motionEaseInOut: string;
  motionEaseInOutCirc: string;
  motionEaseInQuint: string;
  motionEaseOut: string;
  motionEaseOutBack: string;
  motionEaseOutCirc: string;
  motionEaseOutQuint: string;
  // 动画
  motionUnit: number;
  // 透明度
  opacityImage: number;

  sizeStep: number;

  // 尺寸
  sizeUnit: number;
  // 开关
  wireframe: boolean;
}

// ======================================================================
// ==                            Map Token                             ==
// ======================================================================
// 映射 Token，从 Seed Token 派生的中间层 Token

// 颜色映射 Token
export interface ColorMapToken {
  colorBgBase: string;
  colorBgContainer: string;
  colorBgElevated: string;
  // 背景色
  colorBgLayout: string;
  colorBgMask: string;
  // 实心背景色
  colorBgSolid: string;
  colorBgSolidActive: string;
  colorBgSolidHover: string;
  colorBgSpotlight: string;
  // 边框色
  colorBorder: string;

  colorBorderSecondary: string;
  colorError: string;
  colorErrorActive: string;
  colorErrorBg: string;
  colorErrorBgHover: string;
  colorErrorBorder: string;

  colorErrorBorderHover: string;
  colorErrorHover: string;
  colorErrorText: string;
  colorErrorTextActive: string;
  colorErrorTextHover: string;

  // 填充色
  colorFill: string;
  colorFillQuaternary: string;
  colorFillSecondary: string;

  colorFillTertiary: string;
  colorInfo: string;

  colorInfoActive: string;
  colorInfoBg: string;
  colorInfoBgHover: string;
  colorInfoBorder: string;

  colorInfoBorderHover: string;
  colorInfoHover: string;
  colorInfoText: string;
  colorInfoTextActive: string;
  colorInfoTextHover: string;
  // 链接色梯度
  colorLink: string;
  colorLinkActive: string;
  colorLinkHover: string;
  // 品牌色梯度
  colorPrimary: string;
  colorPrimaryActive: string;
  colorPrimaryBg: string;
  colorPrimaryBgHover: string;
  colorPrimaryBorder: string;

  colorPrimaryBorderHover: string;
  colorPrimaryHover: string;
  colorPrimaryText: string;
  colorPrimaryTextActive: string;
  colorPrimaryTextHover: string;
  // 功能色梯度
  colorSuccess: string;
  colorSuccessActive: string;
  colorSuccessBg: string;
  colorSuccessBgHover: string;
  colorSuccessBorder: string;

  colorSuccessBorderHover: string;
  colorSuccessHover: string;
  colorSuccessText: string;
  colorSuccessTextActive: string;
  colorSuccessTextHover: string;
  colorText: string;
  // 中性色
  colorTextBase: string;
  colorTextQuaternary: string;
  colorTextSecondary: string;
  colorTextTertiary: string;

  colorWarning: string;
  colorWarningActive: string;
  colorWarningBg: string;
  colorWarningBgHover: string;
  colorWarningBorder: string;
  colorWarningBorderHover: string;
  colorWarningHover: string;
  colorWarningText: string;
  colorWarningTextActive: string;
  colorWarningTextHover: string;

  // 纯色
  colorWhite: string;
}

// 尺寸映射 Token
export interface SizeMapToken {
  size: number;
  sizeLG: number;
  sizeMD: number;
  sizeMS: number;
  sizeSM: number;
  sizeXL: number;
  sizeXS: number;
  sizeXXL: number;
  sizeXXS: number;
}

// 高度映射 Token
export interface HeightMapToken {
  controlHeightLG: number;
  controlHeightSM: number;
  controlHeightXS: number;
}

// 字体映射 Token
export interface FontMapToken {
  fontHeight: number;
  fontHeightLG: number;
  fontHeightSM: number;
  fontSize: number;
  fontSizeHeading1: number;
  fontSizeHeading2: number;
  fontSizeHeading3: number;
  fontSizeHeading4: number;
  fontSizeHeading5: number;

  fontSizeLG: number;
  fontSizeSM: number;
  fontSizeXL: number;
  lineHeight: number;
  lineHeightHeading1: number;
  lineHeightHeading2: number;
  lineHeightHeading3: number;
  lineHeightHeading4: number;

  lineHeightHeading5: number;
  lineHeightLG: number;
  lineHeightSM: number;
}

// 样式映射 Token
export interface StyleMapToken {
  borderRadiusLG: number;
  borderRadiusOuter: number;
  borderRadiusSM: number;
  borderRadiusXS: number;
  lineWidthBold: number;
}

// 通用映射 Token
export interface CommonMapToken {
  motionDurationFast: string;
  motionDurationMid: string;
  motionDurationSlow: string;
}

export interface MapToken
  extends SeedToken,
    ColorMapToken,
    SizeMapToken,
    HeightMapToken,
    FontMapToken,
    StyleMapToken,
    CommonMapToken {}

// ======================================================================
// ==                           Alias Token                            ==
// ======================================================================
// 别名 Token，最终给开发者使用的 Token
export interface AliasToken extends MapToken {
  // 阴影
  boxShadow: {
    elevation: number;
    shadowColor: string;
    shadowOffset: { height: number; width: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  boxShadowSecondary: {
    elevation: number;
    shadowColor: string;
    shadowOffset: { height: number; width: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  boxShadowTertiary: {
    elevation: number;
    shadowColor: string;
    shadowOffset: { height: number; width: number };
    shadowOpacity: number;
    shadowRadius: number;
  };
  colorBgContainerDisabled: string;
  colorBgTextActive: string;
  colorBgTextHover: string;

  // 背景边框颜色
  colorBorderBg: string;
  colorErrorOutline: string;

  colorFillAlter: string;
  // 内容区域背景色
  colorFillContent: string;
  colorFillContentHover: string;
  colorHighlight: string;
  // 图标颜色
  colorIcon: string;
  colorIconHover: string;
  colorSplit: string;

  colorTextDescription: string;
  colorTextDisabled: string;

  colorTextHeading: string;
  colorTextLabel: string;
  colorTextLightSolid: string;

  // 文本颜色
  colorTextPlaceholder: string;
  colorWarningOutline: string;
  controlInteractiveSize: number;

  controlItemBgActive: string;
  controlItemBgActiveDisabled: string;
  controlItemBgActiveHover: string;
  controlItemBgHover: string;
  // 轮廓颜色
  controlOutline: string;
  // 控制器
  controlOutlineWidth: number;

  // 控制器内边距
  controlPaddingHorizontal: number;

  controlPaddingHorizontalSM: number;
  // 字体
  fontSizeIcon: number;
  fontWeight: FontWeightType;
  fontWeightStrong: FontWeightType;
  // 线条
  lineWidthFocus: number;
  margin: number;
  marginLG: number;

  marginMD: number;
  marginSM: number;
  marginXL: number;
  marginXS: number;
  marginXXL: number;
  // 外边距
  marginXXS: number;

  opacityDisabled: number;
  // 透明度
  opacityLoading: number;
  padding: number;
  paddingContentHorizontal: number;
  // 内容内边距
  paddingContentHorizontalLG: number;
  paddingContentHorizontalSM: number;
  paddingContentVertical: number;
  paddingContentVerticalLG: number;

  paddingContentVerticalSM: number;
  paddingLG: number;
  paddingMD: number;

  paddingSM: number;
  paddingXL: number;

  paddingXS: number;
  // 内边距
  paddingXXS: number;

  screenLG: number;
  screenLGMax: number;
  screenLGMin: number;
  screenMD: number;
  screenMDMax: number;
  screenMDMin: number;
  screenSM: number;
  screenSMMax: number;
  screenSMMin: number;
  screenXL: number;
  screenXLMax: number;
  screenXLMin: number;
  // 屏幕断点
  screenXS: number;
  screenXSMax: number;
  screenXSMin: number;
  screenXXL: number;
  screenXXLMin: number;
}

// ======================================================================
// ==                           Theme                                   ==
// ======================================================================
export interface Theme {
  isDark: boolean;
  mode: ThemeMode;
  token: AliasToken;
}

export interface ThemeContextValue {
  setThemeMode: (mode: ThemeMode) => void;
  theme: Theme;
  toggleTheme: () => void;
}

// 算法类型
export type MappingAlgorithm = (token: SeedToken) => MapToken;

// 主题配置
export interface ThemeConfig {
  algorithm?: MappingAlgorithm | MappingAlgorithm[];
  token?: Partial<SeedToken>;
}
