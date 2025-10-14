import { Platform } from 'react-native';

import { colorScales } from '../color';
import type { PresetColorType, SeedToken } from '../interface';

// 字体定义
const FONT_CN = Platform.select({
  android: 'HarmonyOS-Sans-SC',
  default: 'HarmonyOS-Sans-SC',
  ios: 'HarmonyOS Sans SC',
}) as string;

const FONT_CODE = Platform.select({
  android: 'Hack',
  default: 'Hack',
  ios: 'Hack',
}) as string;

// 从 colorScales 中提取主色值（light 模式索引 9）作为 preset colors
export const defaultPresetColors: PresetColorType = {
  blue: colorScales.blue.light[9],
  cyan: colorScales.cyan.light[9],
  geekblue: colorScales.geekblue.light[9],
  gold: colorScales.gold.light[9],
  gray: colorScales.gray.light[9],
  green: colorScales.green.light[9],
  lime: colorScales.lime.light[9],
  magenta: colorScales.magenta.light[9],
  orange: colorScales.orange.light[9],
  purple: colorScales.purple.light[9],
  red: colorScales.red.light[9],
  volcano: colorScales.volcano.light[9],
  yellow: colorScales.yellow.light[9],
};

/**
 * 默认种子 Token
 * 基础设计 Token，用于派生其他 Token
 */
const seedToken: SeedToken = {
  ...defaultPresetColors,

  // 圆角
  borderRadius: 6,

  colorBgBase: '#ffffff',

  colorError: '#ff4d4f',

  colorInfo: '#1677ff',

  colorLink: '#1677ff',

  // 品牌色 - 默认使用 primary 色阶的主色值
  colorPrimary: colorScales.primary.light[9],

  // 功能色
  colorSuccess: '#52c41a',

  // 中性色基础
  colorTextBase: '#000000',

  colorWarning: '#faad14',

  colorWhite: '#fff',

  controlHeight: 36,

  // 字体配置
  fontFamily: FONT_CN,
  fontFamilyCode: FONT_CODE,

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
