import { primaryColors } from './color';
import type { SeedToken, PresetColorType } from './interface';

// 字体定义
const FONT_EN = `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif`;
const FONT_CN = `"PingFang SC", "Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "Source Han Sans CN", sans-serif`;
const FONT_EMOJI = `"Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji"`;
const FONT_CODE = `"SF Mono", "Menlo", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", "Consolas", "Courier New", monospace`;

// 优先使用系统默认字体
const FONT_SYSTEM = 'System';

export const defaultPresetColors: PresetColorType = primaryColors;

/**
 * 默认种子 Token
 * 基础设计 Token，用于派生其他 Token
 */
const seedToken: SeedToken = {
  ...defaultPresetColors,

  // 圆角
  borderRadius: 6,

  colorBgBase: '',

  colorError: '#ff4d4f',

  colorInfo: '#1677ff',

  colorLink: '',

  // 品牌色 - 默认使用黑色作为主色
  colorPrimary: primaryColors.primary,

  // 功能色
  colorSuccess: '#52c41a',

  // 中性色基础
  colorTextBase: '',

  colorWarning: '#faad14',

  colorWhite: '#fff',

  controlHeight: 32,
  // 优先使用系统默认字体
  fontFamily: [FONT_SYSTEM, FONT_EN, FONT_CN, FONT_EMOJI].join(','),
  fontFamilyCode: [FONT_CODE, FONT_CN, FONT_SYSTEM, FONT_EMOJI].join(','),

  fontSize: 14,

  lineType: 'solid',

  // 线宽
  lineWidth: 1,

  motion: true,

  motionBase: 0,

  motionEaseInBack: 'cubic-bezier(0.71, -0.46, 0.88, 0.6)',

  motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',

  motionEaseInOutCirc: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',

  motionEaseInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',

  motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',

  motionEaseOutBack: 'cubic-bezier(0.12, 0.4, 0.29, 1.46)',

  motionEaseOutCirc: 'cubic-bezier(0.08, 0.82, 0.17, 1)',

  motionEaseOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',

  // 动画
  motionUnit: 0.1,

  neutralColor: 'mauve',

  // 透明度
  opacityImage: 1,

  primaryColor: 'primary',

  sizePopupArrow: 12,

  sizeStep: 4,

  // 尺寸
  sizeUnit: 4,

  // 开关
  wireframe: false,
  // zIndex
  zIndexBase: 0,

  zIndexPopupBase: 1000,
};

export default seedToken;
