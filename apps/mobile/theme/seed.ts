import type { SeedToken } from '@/mobile/types/theme';

/**
 * 默认种子 Token
 * 基础设计 Token，用于派生其他 Token
 */
export const defaultSeedToken: SeedToken = {
  // 圆角
  borderRadius: 6,

  colorBgBase: '',

  colorError: '#ff4d4f',

  colorInfo: '#1677ff',

  // 品牌色 - 使用透明色作为主色
  colorPrimary: 'rgba(0, 0, 0, 0)',

  // 功能色
  colorSuccess: '#52c41a',

  // 中性色基础
  colorTextBase: '',

  colorWarning: '#faad14',

  controlHeight: 32,

  // 字体
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',

  fontFamilyCode: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',

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

  // 透明度
  opacityImage: 1,

  sizeStep: 4,

  // 尺寸
  sizeUnit: 4,
  // 开关
  wireframe: false,
};
